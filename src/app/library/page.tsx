"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Images } from "lucide-react"
import Link from "next/link"
import LibraryGrid from "@/components/modules/library-grid"
import { StoredImageData } from "@/types/image"

export default function LibraryPage() {
  const [images, setImages] = useState<StoredImageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Images size={48} className="text-white" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Image Library
              </h1>
            </div>
            <p className="text-xl text-white/70 mb-4">
              Your AI-edited images collection
            </p>
            {!isLoading && (
              <p className="text-white/60">
                {images.length} {images.length === 1 ? "image" : "images"} •{" "}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 text-white/70 text-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/70"></div>
                Loading your images...
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                <Images size={64} className="text-white/40 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">
                  No images yet
                </h3>
                <p className="text-white/70 mb-8">
                  Start by editing your first image in the editor
                </p>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Editor
                </Link>
              </div>
            </div>
          ) : (
            <LibraryGrid images={images} onDeleteImage={(id) => {}} />
          )}
        </div>
      </div>
    </div>
  )
}
