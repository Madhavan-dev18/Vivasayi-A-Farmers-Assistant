'use client';

import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakButtonProps {
  textToSpeak: string;
  lang?: string;
}

export function SpeakButton({ textToSpeak, lang = 'en-US' }: SpeakButtonProps) {
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      aria-label="Read text aloud"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
