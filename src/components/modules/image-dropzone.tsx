'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
  currentImage: File | null;
  imageUrl: string;
}

export default function ImageDropzone({ onImageUpload, currentImage, imageUrl }: ImageDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB max
  });

  if (currentImage && imageUrl) {
    return (
      <div className="w-full">
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/20">
            <Image
              src={imageUrl}
              alt={currentImage.name}
              fill
              className="object-contain bg-black/20"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-white/80">
              <div>
                <p className="font-medium">{currentImage.name}</p>
                <p className="text-sm text-white/60">
                  {(currentImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => {
                  URL.revokeObjectURL(imageUrl);
                  onImageUpload(currentImage);
                }}
                className="text-sm text-white/60 hover:text-white/80 underline"
              >
                Replace image
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        w-full min-h-96 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
        flex flex-col items-center justify-center gap-6 p-12
        ${isDragActive 
          ? 'border-white/60 bg-white/10' 
          : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`
          p-6 rounded-full transition-all duration-200
          ${isDragActive 
            ? 'bg-white/20' 
            : 'bg-white/10'
          }
        `}>
          {isDragActive ? (
            <Upload size={48} className="text-white animate-bounce" />
          ) : (
            <ImageIcon size={48} className="text-white/70" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image'}
          </h3>
          <p className="text-white/70 text-lg mb-4">
            {isDragActive 
              ? 'Release to upload' 
              : 'Drag and drop an image, or click to browse'
            }
          </p>
          <div className="text-sm text-white/60">
            <p>Supports PNG, JPG, JPEG, GIF, WebP, BMP, TIFF</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}