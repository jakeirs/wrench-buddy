"use client"

import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"

import LibraryGrid from "@/components/modules/library-grid"
import Chat from "@/components/modules/chat"
import { Sheet, CustomSheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  LibraryHeader,
  LibraryTitle,
  EmptyLibraryState,
  LoadingState,
} from "./components"

import { mockChatMessages } from "@/lib/mock-chat-data"

import { LibraryPageProps } from "./types"

export default function LibraryPage({ className = "" }: LibraryPageProps) {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState(mockChatMessages)
  const [isChatOpen, setIsChatOpen] = useState(true)

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      isFromUser: true,
      timestamp: new Date(),
      sender: "You",
    }
    setChatMessages((prev) => [...prev, newMessage])
  }

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Test auto-scroll by adding a new message after 5 seconds
    const timer = setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "5",
          content:
            "This is a new message to test auto-scroll functionality! 🚀",
          isFromUser: false,
          timestamp: new Date(),
          sender: "Alex",
        },
      ])
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 ${className}`}
    >
      {/* Chat Toggle Button - Only visible when Sheet is closed */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <MessageSquare size={20} />
        </Button>
      )}

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <CustomSheetContent side="left" className="w-3xl max-w-none p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Chat</SheetTitle>
          </SheetHeader>
          <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
        </CustomSheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-8">
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
  )
}
