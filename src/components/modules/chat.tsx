'use client';

import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

import ChatMessage from '@/components/modules/chat-message';
import ChatInput from '@/components/modules/chat-input';

import { cn } from '@/lib/utils';

import { ChatProps } from '@/types/chat';

export default function Chat({ messages, onSendMessage, className }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 p-3 lg:p-4 border-b border-gray-200 bg-white">
        <MessageCircle size={18} className="text-blue-600 lg:w-5 lg:h-5" />
        <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 lg:p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}