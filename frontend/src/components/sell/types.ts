export interface ListingFormState {
  error: string;
  success: boolean;
}

export type UploadStatus =
  | "ready"
  | "presigning"
  | "uploading"
  | "complete"
  | "error";

export interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error: string;
}

export interface ListingItemPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export const initialListingFormState: ListingFormState = {
  error: "",
  success: false,
};
