import { create } from 'zustand';
import { ImageStore, EditedImage } from '@/types/image';

export const useImageStore = create<ImageStore>((set, get) => ({
  currentImage: null,
  editedImages: [],
  
  setCurrentImage: (image: EditedImage | null) => {
    set({ currentImage: image });
  },
  
  addEditedImage: (image: EditedImage) => {
    set((state) => ({
      editedImages: [image, ...state.editedImages]
    }));
  },
  
  removeEditedImage: (id: string) => {
    set((state) => ({
      editedImages: state.editedImages.filter(img => img.id !== id),
      currentImage: state.currentImage?.id === id ? null : state.currentImage
    }));
  },
  
  updateImage: (id: string, updates: Partial<EditedImage>) => {
    set((state) => ({
      editedImages: state.editedImages.map(img =>
        img.id === id ? { ...img, ...updates } : img
      ),
      currentImage: state.currentImage?.id === id 
        ? { ...state.currentImage, ...updates }
        : state.currentImage
    }));
  }
}));