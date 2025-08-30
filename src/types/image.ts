export interface EditedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  editedUrl: string | null;
  editedUrls: string[];
  prompt: string;
  createdAt: Date;
  isProcessing: boolean;
  description?: string;
  requestId?: string;
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
  editedUrls: string[];
  prompt: string;
  createdAt: string;
  fileName: string;
  fileSize: number;
  isProcessing: boolean;
  description?: string;
  requestId?: string;
}

// Fal AI API interfaces
export interface FalImageFile {
  url: string;
  file_name?: string;
  file_size?: number;
}

export interface FalEditRequest {
  prompt: string;
  image_urls: string[];
  num_images?: number;
  output_format?: 'jpeg' | 'png';
  sync_mode?: boolean;
}

export interface FalEditResponse {
  images: FalImageFile[];
  description: string;
}

export interface ApiEditResponse {
  success: boolean;
  data: {
    images: FalImageFile[];
    description: string;
    originalFileName: string;
    originalFileSize: number;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}