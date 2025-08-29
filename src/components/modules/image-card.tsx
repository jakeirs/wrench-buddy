'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoredImageData } from '@/types/image';
import { Trash2, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';

interface ImageCardProps {
  image: StoredImageData;
  onDelete: () => void;
}

export default function ImageCard({ image, onDelete }: ImageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const truncatedPrompt = image.prompt.split(' ').slice(0, 7).join(' ');
  const shouldShowExpand = image.prompt.split(' ').length > 7;
  const displayUrl = image.editedUrl || image.originalUrl;
  
  const createdDate = new Date(image.createdAt);
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      onDelete();
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete Button Overlay */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm border border-red-400/50"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      <CardContent className="p-0">
        {/* Image Thumbnail */}
        <div className="relative aspect-video bg-black/20 overflow-hidden">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-white/60">
              <FileText size={48} />
            </div>
          ) : (
            <Image
              src={displayUrl}
              alt={`Edited: ${truncatedPrompt}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Processing Indicator */}
          {image.isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Processing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="p-4 space-y-3">
          {/* Prompt */}
          <div className="space-y-2">
            <p className="text-white font-medium text-sm leading-relaxed">
              {isExpanded ? image.prompt : truncatedPrompt}
              {!isExpanded && shouldShowExpand && '...'}
            </p>
            
            {shouldShowExpand && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-white/70 hover:text-white hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Date and File Info */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{relativeTime}</span>
            </div>
            <div className="text-right">
              <p className="truncate max-w-24" title={image.fileName}>
                {image.fileName}
              </p>
              <p>{(image.fileSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}