"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function GeminiChat() {
  const [isLoading, setIsLoading] = useState(false)

  const handleTestGemini = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What's your name?",
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("Gemini Response:", data.response)
        alert(`Gemini says: ${data.response}`)
      } else {
        console.error("Error:", data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Request failed:", error)
      alert("Failed to connect to Gemini")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-600 transition-colors">
          <MessageCircle size={48} className="text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Gemini Chat</CardTitle>
        <p className="text-white/80 text-lg">Test Google's Gemini AI</p>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleTestGemini}
          disabled={isLoading}
          className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white"
          data-testid="gemini-test-button"
        >
          {isLoading ? "Testing..." : "Test Gemini"}
        </Button>
      </CardContent>
    </Card>
  )
}
