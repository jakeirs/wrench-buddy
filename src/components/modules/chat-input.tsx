'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

export default function ChatInput({ onSendMessage, className }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex items-end gap-2 p-3 lg:p-4 border-t border-gray-200 bg-white", className)}>
      <Textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        className="min-h-[40px] max-h-[120px] resize-none flex-1 text-sm lg:text-base"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!inputValue.trim()}
        size="sm"
        className="shrink-0 h-[40px] px-3"
      >
        <Send size={16} />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}