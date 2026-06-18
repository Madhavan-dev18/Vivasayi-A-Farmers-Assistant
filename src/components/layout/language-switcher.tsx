
'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LanguageSwitcher() {
  const t = {
    selectLanguage: 'Select Language'
  };
  const [locale, setLocale] = useState('en');

  function onSelectChange(value: string) {
    setLocale(value);
    // In a real app, you'd likely want to change the actual locale here.
    // For now, this is a visual-only change.
  }

  // A simplified list of languages for this single-language version
  const allLocales = [
    { code: 'en', name: 'English' },
  ];

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange} disabled>
      <SelectTrigger className="w-fit">
        <SelectValue placeholder={t.selectLanguage} />
      </SelectTrigger>
      <SelectContent>
        {allLocales.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
