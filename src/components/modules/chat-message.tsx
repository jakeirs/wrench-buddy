'use client';

import { format } from 'date-fns';

import { cn } from '@/lib/utils';

import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-2 lg:mb-4",
        message.isFromUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] lg:max-w-[80%] rounded-lg px-2 py-1.5 lg:px-3 lg:py-2",
          message.isFromUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800"
        )}
      >
        <div className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1">
          {message.sender}
        </div>
        <div className="text-xs lg:text-sm leading-relaxed">
          {message.content}
        </div>
        <div
          className={cn(
            "text-[10px] lg:text-xs mt-0.5 lg:mt-1 opacity-70",
            message.isFromUser ? "text-blue-100" : "text-gray-500"
          )}
        >
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  );
}