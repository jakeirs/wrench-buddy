'use client';

import { StoredImageData } from '@/types/image';
import ImageCard from './image-card';

interface LibraryGridProps {
  images: StoredImageData[];
  onDeleteImage: (id: string) => void;
}

export default function LibraryGrid({ images, onDeleteImage }: LibraryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {images.map((image) => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onDelete={() => onDeleteImage(image.id)} 
        />
      ))}
    </div>
  );
}