'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Forcing TypeScript to recognize DOM Speech APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  lang?: string;
}

export function VoiceInputButton({ onTranscript, lang = 'en-US' }: VoiceInputButtonProps) {
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
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({
        variant: 'destructive',
        title: 'Voice Error',
        description: `Could not start voice recognition: ${event.error}`,
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
  }, [lang, onTranscript, toast]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported',
        description: 'Voice input is not supported on your browser.',
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