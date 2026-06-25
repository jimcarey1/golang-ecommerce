import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { getPresignedUrl } from "../services/auth";
import type { SelectedImage } from "../components/sell/types";

function createImageId(file: File) {
  const randomId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return `${file.name}-${file.lastModified}-${randomId}`;
}

function getUploadedImageUrl(uploadUrl: string) {
  return uploadUrl.split("?")[0];
}

export function useImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      for (const previewUrl of previewUrls) {
        URL.revokeObjectURL(previewUrl);
      }

      previewUrls.clear();
    };
  }, []);

  function updateImage(id: string, updates: Partial<SelectedImage>) {
    setSelectedImages((currentImages) =>
      currentImages.map((image) =>
        image.id === id ? { ...image, ...updates } : image,
      ),
    );
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    const images = imageFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      return {
        id: createImageId(file),
        file,
        previewUrl,
        progress: 0,
        status: "ready" as const,
        error: "",
      };
    });

    setSelectedImages((currentImages) => [...currentImages, ...images]);
    event.target.value = "";
  }

  function removeSelectedImage(imageId: string) {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find(
        (image) => image.id === imageId,
      );

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
        previewUrlsRef.current.delete(imageToRemove.previewUrl);
      }

      return currentImages.filter((image) => image.id !== imageId);
    });
  }

  function clearSelectedImages() {
    for (const image of selectedImages) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrlsRef.current.delete(image.previewUrl);
    }

    setSelectedImages([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadImage(image: SelectedImage) {
    updateImage(image.id, {
      error: "",
      progress: 0,
      status: "presigning",
    });

    try {
      const presignedResponse = await getPresignedUrl(image.file.name);
      const uploadUrl = presignedResponse.data.url;

      updateImage(image.id, {
        progress: 0,
        status: "uploading",
      });

      await axios.put(uploadUrl, image.file, {
        headers: {
          "Content-Type": image.file.type,
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? image.file.size;

          const progress = total
            ? Math.min(100, Math.round((progressEvent.loaded / total) * 100))
            : 0;

          updateImage(image.id, { progress });
        },
      });

      updateImage(image.id, {
        progress: 100,
        status: "complete",
      });

      return getUploadedImageUrl(uploadUrl);
    } catch (error) {
      updateImage(image.id, {
        error: error instanceof Error ? error.message : "Upload failed.",
        status: "error",
      });

      throw error;
    }
  }

  async function uploadFiles() {
    if (selectedImages.length === 0) return [];

    return Promise.all(selectedImages.map(uploadImage));
  }

  return {
    fileInputRef,
    selectedImages,
    handleFileChange,
    removeSelectedImage,
    clearSelectedImages,
    uploadFiles,
    uploadImage,
  };
}