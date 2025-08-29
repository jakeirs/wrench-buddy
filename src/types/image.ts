export interface EditedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  editedUrl: string | null;
  prompt: string;
  createdAt: Date;
  isProcessing: boolean;
}

export interface ImageStore {
  currentImage: EditedImage | null;
  editedImages: EditedImage[];
  setCurrentImage: (image: EditedImage | null) => void;
  addEditedImage: (image: EditedImage) => void;
  removeEditedImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<EditedImage>) => void;
}

export interface StoredImageData {
  id: string;
  originalUrl: string;
  editedUrl: string | null;
  prompt: string;
  createdAt: string;
  fileName: string;
  fileSize: number;
  isProcessing: boolean;
}