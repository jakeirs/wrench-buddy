'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageDropzone from '@/components/modules/image-dropzone';
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageUpload = (file: File) => {
    setCurrentImage(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleEdit = () => {
    if (!currentImage || !prompt.trim()) return;
    
    console.log('Edit image:', currentImage.name, 'with prompt:', prompt);
    // TODO: Implement API call to Gemini
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              AI Image Editor
            </h1>
            <p className="text-xl text-white/70">
              Upload an image and describe how you want to edit it
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <ImageDropzone 
                onImageUpload={handleImageUpload}
                currentImage={currentImage}
                imageUrl={imageUrl}
              />
            </div>

            {currentImage && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-lg font-medium text-white mb-3">
                    Describe your edit
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe how you want to edit the image... (e.g., 'Change the background to a sunset', 'Add sunglasses to the person', 'Make it black and white')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-32 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 resize-none"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleEdit}
                  disabled={!prompt.trim()}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white border-0"
                >
                  <Wand2 className="mr-2" size={24} />
                  Edit Image with AI
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}