import { ArrowLeft, Images } from 'lucide-react';
import Link from 'next/link';

export function LibraryHeader() {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Home
      </Link>
    </div>
  );
}

export function LibraryTitle({ imageCount }: { imageCount: number }) {
  return (
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
      <p className="text-white/60">
        {imageCount} {imageCount === 1 ? "image" : "images"} •{" "}
      </p>
    </div>
  );
}

export function EmptyLibraryState() {
  return (
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
  );
}

export function LoadingState() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-3 text-white/70 text-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/70"></div>
        Loading your images...
      </div>
    </div>
  );
}