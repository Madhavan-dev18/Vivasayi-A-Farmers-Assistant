import { describe, it, expect } from 'vitest';
import { getLanguageMeta, SUPPORTED_LANGUAGES } from '../languages';

describe('Language Utilities', () => {
  it('should return default language metadata if code is not found', () => {
    // @ts-ignore
    const meta = getLanguageMeta('invalid-code');
    expect(meta.code).toBe('en');
    expect(meta.englishName).toBe('English');
  });

  it('should return correct language metadata for supported codes', () => {
    const taMeta = getLanguageMeta('ta');
    expect(taMeta.code).toBe('ta');
    expect(taMeta.nativeName).toBe('தமிழ்');
    expect(taMeta.englishName).toBe('Tamil');

    const hiMeta = getLanguageMeta('hi');
    expect(hiMeta.code).toBe('hi');
    expect(hiMeta.nativeName).toBe('हिन्दी');
    expect(hiMeta.englishName).toBe('Hindi');
  });

  it('should contain all expected languages in SUPPORTED_LANGUAGES', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(23);
  });
});
