'use client';

import { useEffect, useState } from 'react';

import LibraryGrid from '@/components/modules/library-grid';
import Chat from '@/components/modules/chat';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { LibraryHeader, LibraryTitle, EmptyLibraryState, LoadingState } from './components';

import { mockChatMessages } from '@/lib/mock-chat-data';

import { LibraryPageProps } from './types';

export default function LibraryPage({ className = '' }: LibraryPageProps) {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState(mockChatMessages);

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      isFromUser: true,
      timestamp: new Date(),
      sender: 'You'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Test auto-scroll by adding a new message after 5 seconds
    const timer = setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: '5',
        content: 'This is a new message to test auto-scroll functionality! 🚀',
        isFromUser: false,
        timestamp: new Date(),
        sender: 'Alex'
      }]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 ${className}`}>
      {/* Desktop Chat - Fixed left sidebar */}
      <div className="hidden lg:block">
        <Sheet open={true} modal={false}>
          <SheetContent
            side="left"
            className="w-80 p-0 border-none fixed left-0 top-0 h-full z-50 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Chat</SheetTitle>
            <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Chat - Bottom drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="h-32 bg-white border-t border-gray-200">
          <div className="h-full overflow-y-auto">
            <Chat messages={chatMessages} onSendMessage={handleSendMessage} className="h-full" />
          </div>
        </div>
      </div>

      <div className="lg:ml-80 transition-all duration-300 container mx-auto px-4 py-8 pb-36 lg:pb-8">
        <LibraryHeader />

        <div className="max-w-7xl mx-auto">
          <LibraryTitle imageCount={images.length} />

          {isLoading ? (
            <LoadingState />
          ) : images.length === 0 ? (
            <EmptyLibraryState />
          ) : (
            <LibraryGrid images={images} onDeleteImage={(id) => {}} />
          )}
        </div>
      </div>
    </div>
  );
}