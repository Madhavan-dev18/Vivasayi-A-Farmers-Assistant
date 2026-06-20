'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';

// Forcing TypeScript to recognize DOM Speech APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  /** Optional override — defaults to the app's currently selected language. */
  lang?: string;
}

export function VoiceInputButton({ onTranscript, lang }: VoiceInputButtonProps) {
  const { language, t } = useLanguage();
  const effectiveLang = lang ?? getLanguageMeta(language).speechLang;
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = effectiveLang;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      // "language-not-supported" means the device/browser can't
      // recognize speech in the selected language at all — different
      // from other errors (no-speech, network, aborted), so it gets a
      // more specific, actionable message instead of a generic one.
      const description =
        event.error === 'language-not-supported'
          ? t('VoiceInputButton.languageNotSupportedDescription').replace('{langName}', getLanguageMeta(language).englishName)
          : t('VoiceInputButton.genericErrorDescription').replace('{error}', event.error);
      toast({
        variant: 'destructive',
        title: t('VoiceInputButton.errorTitle'),
        description,
      });
      setIsListening(false);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    // Cleanup function to prevent memory leaks and release the microphone
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors on unmount
        }
      }
    };
  }, [effectiveLang, language, onTranscript, toast]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: t('VoiceInputButton.unsupportedTitle'),
        description: t('VoiceInputButton.unsupportedDescription'),
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleListening}
      className="h-7 w-7"
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 text-destructive animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}