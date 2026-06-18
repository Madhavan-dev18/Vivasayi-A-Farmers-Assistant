/**
 * Retries a Gemini/Genkit call on transient failures (model overloaded,
 * momentary rate-limit burst, network blip) with exponential backoff.
 *
 * Does NOT retry on errors that will never succeed on retry:
 * - Bad API key, invalid request, schema mismatch (400/401/403) — retrying
 *   these just burns time for a guaranteed-identical failure.
 * - DAILY QUOTA exhaustion (free-tier "GenerateRequestsPerDayPerProjectPerModel"
 *   429s) — these won't clear for minutes/hours, so backoff retries are
 *   pointless. Quota errors skip straight to the fallback model instead.
 *
 * Use this around any call that hits the Gemini API directly: both
 * ai.definePrompt(...)'s returned prompt() function and ai.generate().
 */

const RETRYABLE_STATUS_CODES = [429, 500, 503, 504];

type ErrorClassification = {
  retryable: boolean;
  /** True for a 429 that is specifically a per-day quota cap, not a
   * short burst rate limit. These should never be backoff-retried —
   * only worth trying a different model/key. */
  isDailyQuotaExhaustion: boolean;
};

function classifyError(error: unknown): ErrorClassification {
  const message = error instanceof Error ? error.message : String(error);

  // Daily quota signals: Google's free-tier 429s name the quota
  // explicitly (e.g. "GenerateRequestsPerDayPerProjectPerModel-FreeTier")
  // and/or mention "quota" alongside "per day". A burst rate-limit 429
  // (e.g. requests-per-minute) does NOT include "PerDay" in the quotaId
  // and IS worth a short backoff retry.
  const isDailyQuotaExhaustion =
    /PerDay/i.test(message) || /exceeded your current quota/i.test(message);

  if (isDailyQuotaExhaustion) {
    return { retryable: false, isDailyQuotaExhaustion: true };
  }

  // Genkit/the Google AI SDK don't always expose a clean `.status` field
  // on thrown errors — the status code is often only present in the
  // message string (e.g. "[503 Service Unavailable] ..."). Check both.
  const statusMatch = message.match(/\[(\d{3})\s/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    if (RETRYABLE_STATUS_CODES.includes(status)) {
      return { retryable: true, isDailyQuotaExhaustion: false };
    }
    // Any other explicit status code (400, 401, 403, etc.) is NOT
    // retryable — retrying a bad request or bad auth just wastes calls.
    return { retryable: false, isDailyQuotaExhaustion: false };
  }

  // Fallback: no status code found in the message, but it mentions
  // overload/availability/rate-limit language — treat as retryable
  // rather than risk swallowing a real transient failure.
  const retryable = /overloaded|unavailable|high demand|rate limit|try again/i.test(message);
  return { retryable, isDailyQuotaExhaustion: false };
}

export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    baseDelayMs?: number;
    /**
     * If the primary call fails with a retryable error after all retries
     * (or immediately, for daily quota exhaustion), this is called ONCE
     * as a last resort — typically a copy of `fn` pointed at a different
     * model. Not retried itself; if this also fails, the ORIGINAL error
     * from the primary model is what gets thrown, since that's the model
     * the caller actually asked for.
     */
    fallback?: () => Promise<T>;
  } = {}
): Promise<T> {
  const { retries = 3, baseDelayMs = 1000, fallback } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const { retryable, isDailyQuotaExhaustion } = classifyError(error);

      if (!retryable && !isDailyQuotaExhaustion) {
        throw error;
      }

      if (isDailyQuotaExhaustion) {
        // No point backing off — this won't clear on its own for a long
        // time. Go straight to the fallback model below.
        console.warn(
          'Daily quota exhausted for this model, skipping retries and trying fallback model:',
          error instanceof Error ? error.message.slice(0, 200) : error
        );
        break;
      }

      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        break; // fall through to the fallback attempt below, if any
      }

      // Exponential backoff with jitter: 1s, 2s, 4s (+/- up to 250ms),
      // so concurrent requests don't all retry in lockstep.
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 250;
      console.warn(
        `Gemini call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(delay)}ms:`,
        error instanceof Error ? error.message : error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  if (fallback) {
    try {
      console.warn('Trying fallback model...');
      return await fallback();
    } catch (fallbackError) {
      console.warn(
        'Fallback model also failed:',
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      );
      // Surface the ORIGINAL error, not the fallback's — the caller asked
      // for the primary model, so that's the failure that matters most.
      throw lastError;
    }
  }

  throw lastError;
}
