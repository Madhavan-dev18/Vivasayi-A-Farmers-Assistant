'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/languages';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as LanguageCode)}>
      <SelectTrigger className="w-[88px] shrink-0 sm:w-[120px]">
        <SelectValue placeholder={t('LanguageSwitcher.selectLanguage')} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
