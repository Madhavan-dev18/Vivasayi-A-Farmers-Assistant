
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { multilingualChatbotAssistance } from '@/ai/flows/multilingual-chatbot-assistance';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, LoaderCircle, Send, User, Wheat } from 'lucide-react';
import { VoiceInputButton } from './voice-input-button';
import { SpeakButton } from './speak-button';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta } from '@/lib/languages';

type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
};

export default function Chatbot() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSlow, setIsSlow] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      // Most successful Flash responses return well under 4s. If we're
      // still waiting past that, it's very likely a retry or fallback
      // is happening behind the scenes — tell the user that's normal,
      // rather than leaving the same unchanging spinner up, which reads
      // as "stuck" rather than "still working."
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 4000);

      try {
        const response = await multilingualChatbotAssistance({ query: currentInput, language: getLanguageMeta(language).englishName });
        const botMessage: Message = { id: crypto.randomUUID(), role: 'bot', text: response.answer };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Chatbot error:', error);
        const message = error instanceof Error ? error.message : '';
        const isOverloaded = /503|overloaded|high demand/i.test(message);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          text: isOverloaded
            ? "Our AI service is getting a lot of requests right now. Please try again in a minute."
            : "Sorry, I couldn't process that. Please try again in a moment.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        setIsSlow(false);
      }
    });
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" size="icon">
          <Bot className="h-8 w-8" />
          <span className="sr-only">{t('Chatbot.openChatbot')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Wheat className="text-primary" /> {t('Chatbot.title')}
          </DialogTitle>
          <DialogDescription>
            {t('Chatbot.description')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] border-y" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                   {message.role === 'bot' && <SpeakButton textToSpeak={message.text} />}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        {isSlow && <span className="text-muted-foreground">Still working on it...</span>}
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 sm:justify-start">
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('Chatbot.inputPlaceholder')}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                 <VoiceInputButton onTranscript={handleVoiceInput} />
              </div>
            </div>
            <Button size="icon" onClick={handleSend} disabled={isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
