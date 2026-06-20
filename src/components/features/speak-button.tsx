'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';
import { useToast } from '@/hooks/use-toast';

interface SpeakButtonProps {
  textToSpeak: string;
  /**
   * Optional override. Most callers should omit this — SpeakButton
   * defaults to the app's currently selected language automatically, so
   * a response that came back in Tamil gets read aloud in Tamil without
   * every call site needing to remember to pass it.
   */
  lang?: string;
}

/**
 * Finds the best installed voice for a BCP-47 language tag. Browsers
 * vary in exactly which voices they ship, and many devices have no
 * voice at all for less-common languages (see the language config notes
 * in src/lib/languages.ts), so this checks for an exact region match
 * first, then falls back to a base-language match (e.g. any "hi-*" voice
 * if "hi-IN" isn't present), and returns null if neither exists.
 */
function findVoiceForLang(targetLang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exact) return exact;

  const baseLang = targetLang.split('-')[0].toLowerCase();
  const baseMatch = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
  return baseMatch ?? null;
}

export function SpeakButton({ textToSpeak, lang }: SpeakButtonProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const targetLang = lang ?? getLanguageMeta(language).speechLang;

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({
        variant: 'destructive',
        title: t('SpeakButton.unsupportedTitle'),
        description: t('SpeakButton.unsupportedDescription'),
      });
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const voice = findVoiceForLang(targetLang);

    // Voice list can be empty on first call in some browsers (it loads
    // asynchronously) — only warn if we have a populated voice list AND
    // still found nothing, not on every call.
    const voicesLoaded = window.speechSynthesis.getVoices().length > 0;
    if (voicesLoaded && !voice) {
      toast({
        title: t('SpeakButton.voiceNotAvailableTitle'),
        description: t('SpeakButton.voiceNotAvailableDescription').replace('{langName}', getLanguageMeta(language).englishName),
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // "canceled"/"interrupted" fire when the user taps the button
      // again to stop speech — that's expected, not an error to report.
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      toast({
        variant: 'destructive',
        title: t('SpeakButton.errorTitle'),
        description: t('SpeakButton.errorDescription'),
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      aria-label={isSpeaking ? 'Stop reading aloud' : 'Read text aloud'}
    >
      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
}
