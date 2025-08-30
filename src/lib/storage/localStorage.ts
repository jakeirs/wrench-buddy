import { StoredImageData, EditedImage } from '@/types/image';

const STORAGE_KEY = 'nano-banana-edited-images';

export const storageUtils = {
  saveEditedImage: (image: EditedImage): void => {
    try {
      const storedImages = storageUtils.getAllEditedImages();
      const imageData: StoredImageData = {
        id: image.id,
        originalUrl: image.originalUrl,
        editedUrl: image.editedUrl,
        editedUrls: image.editedUrls || [],
        prompt: image.prompt,
        createdAt: image.createdAt.toISOString(),
        fileName: image.originalFile.name,
        fileSize: image.originalFile.size,
        isProcessing: image.isProcessing,
        description: image.description,
        requestId: image.requestId
      };
      
      const updatedImages = [imageData, ...storedImages.filter(img => img.id !== image.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to save image to localStorage:', error);
    }
  },

  getAllEditedImages: (): StoredImageData[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load images from localStorage:', error);
      return [];
    }
  },

  removeEditedImage: (id: string): void => {
    try {
      const storedImages = storageUtils.getAllEditedImages();
      const filteredImages = storedImages.filter(img => img.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredImages));
      
      // Clean up blob URLs to prevent memory leaks
      const imageToRemove = storedImages.find(img => img.id === id);
      if (imageToRemove?.originalUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.originalUrl);
      }
      if (imageToRemove?.editedUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.editedUrl);
      }
      // Clean up multiple edited URLs
      imageToRemove?.editedUrls?.forEach(url => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Failed to remove image from localStorage:', error);
    }
  },

  updateEditedImage: (id: string, updates: Partial<StoredImageData>): void => {
    try {
      const storedImages = storageUtils.getAllEditedImages();
      const updatedImages = storedImages.map(img =>
        img.id === id ? { ...img, ...updates } : img
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to update image in localStorage:', error);
    }
  },

  clearAllImages: (): void => {
    try {
      // Clean up blob URLs before clearing
      const storedImages = storageUtils.getAllEditedImages();
      storedImages.forEach(img => {
        if (img.originalUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(img.originalUrl);
        }
        if (img.editedUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(img.editedUrl);
        }
        // Clean up multiple edited URLs
        img.editedUrls?.forEach(url => {
          if (url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
      
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear images from localStorage:', error);
    }
  },

  getStorageSize: (): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const sizeInBytes = stored ? new Blob([stored]).size : 0;
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return '0 KB';
    }
  }
};