'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ImageData {
  file: File;
  url: string;
  id: string;
}

interface ImageManyDropzoneProps {
  onImagesUpload: (files: ImageData[]) => void;
  currentImages: ImageData[];
  maxImages?: number;
}

export default function ImageManyDropzone({ 
  onImagesUpload, 
  currentImages, 
  maxImages = 5 
}: ImageManyDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxImages - currentImages.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    const newImages: ImageData[] = filesToAdd.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));
    
    onImagesUpload([...currentImages, ...newImages]);
  }, [currentImages, maxImages, onImagesUpload]);

  const removeImage = useCallback((idToRemove: string) => {
    const imageToRemove = currentImages.find(img => img.id === idToRemove);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    const updatedImages = currentImages.filter(img => img.id !== idToRemove);
    onImagesUpload(updatedImages);
  }, [currentImages, onImagesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB max per file
    disabled: currentImages.length >= maxImages
  });

  if (currentImages.length > 0) {
    return (
      <div className="w-full space-y-6">
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentImages.map((imageData) => (
            <div key={imageData.id} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/20">
                <Image
                  src={imageData.url}
                  alt={imageData.file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    onClick={() => removeImage(imageData.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                    size="sm"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-white/80 text-sm font-medium truncate">
                  {imageData.file.name}
                </p>
                <p className="text-white/60 text-xs">
                  {(imageData.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
          
          {/* Add More Button */}
          {currentImages.length < maxImages && (
            <div
              {...getRootProps()}
              className={`
                aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                flex flex-col items-center justify-center gap-2 p-4
                ${isDragActive 
                  ? 'border-white/60 bg-white/10' 
                  : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className={`
                p-3 rounded-full transition-all duration-200
                ${isDragActive 
                  ? 'bg-white/20' 
                  : 'bg-white/10'
                }
              `}>
                {isDragActive ? (
                  <Upload size={24} className="text-white animate-bounce" />
                ) : (
                  <ImageIcon size={24} className="text-white/70" />
                )}
              </div>
              <div className="text-center">
                <p className="text-white/80 text-xs font-medium">
                  {isDragActive ? 'Drop here' : 'Add more'}
                </p>
                <p className="text-white/60 text-xs">
                  {maxImages - currentImages.length} left
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between text-white/80">
            <div>
              <p className="font-medium">
                {currentImages.length} image{currentImages.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-white/60">
                Total size: {(currentImages.reduce((total, img) => total + img.file.size, 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => {
                currentImages.forEach(img => URL.revokeObjectURL(img.url));
                onImagesUpload([]);
              }}
              className="text-sm text-white/60 hover:text-white/80 underline"
            >
              Clear all images
            </button>
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
            {isDragActive ? 'Drop your images here' : 'Upload images'}
          </h3>
          <p className="text-white/70 text-lg mb-4">
            {isDragActive 
              ? 'Release to upload' 
              : `Upload up to ${maxImages} images at once`
            }
          </p>
          <div className="text-sm text-white/60">
            <p>Supports PNG, JPG, JPEG, GIF, WebP, BMP, TIFF</p>
            <p>Maximum file size: 10MB per image</p>
          </div>
        </div>
      </div>
    </div>
  );
}