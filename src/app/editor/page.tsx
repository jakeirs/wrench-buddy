'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageDropzone from '@/components/modules/image-dropzone';
import { ArrowLeft, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";
import { ApiEditResponse, ApiErrorResponse } from '@/types/image';

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleImageUpload = (file: File) => {
    setCurrentImage(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    // Reset previous results
    setEditedImageUrl(null);
    setDescription('');
    setError('');
  };

  const handleEdit = async () => {
    if (!currentImage || !prompt.trim()) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', currentImage);
      formData.append('prompt', prompt);

      console.log('Sending request to /api/image-edit...');
      
      const response = await fetch('/api/image-edit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to edit image');
      }

      const result: ApiEditResponse = await response.json();
      
      console.log('API response:', result);
      
      if (result.success && result.data.images.length > 0) {
        setEditedImageUrl(result.data.images[0].url);
        setDescription(result.data.description || '');
        console.log('Image edited successfully:', result.data.images[0].url);
      } else {
        throw new Error('No edited image received');
      }
      
    } catch (error) {
      console.error('Edit failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
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
                  disabled={!prompt.trim() || isProcessing}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white border-0"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={24} />
                      Processing Image...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2" size={24} />
                      Edit Image with AI
                    </>
                  )}
                </Button>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-200 font-medium">Error: {error}</p>
                  </div>
                )}
              </div>
            )}

            {editedImageUrl && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Edited Result</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={editedImageUrl} 
                      alt="Edited image"
                      className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                  {description && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/80 italic">{description}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => window.open(editedImageUrl, '_blank')}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Open Full Size
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = editedImageUrl;
                        link.download = `edited-${currentImage?.name || 'image'}.jpg`;
                        link.click();
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}