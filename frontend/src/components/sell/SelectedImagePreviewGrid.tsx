import type { SelectedImage } from "./types";

interface SelectedImagePreviewGridProps {
  images: SelectedImage[];
  onRemoveSelectedImage: (imageId: string) => void;
}

export default function SelectedImagePreviewGrid({
  images,
  onRemoveSelectedImage,
}: SelectedImagePreviewGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image) => {
        const isUploading =
          image.status === "presigning" || image.status === "uploading";

        const statusLabel =
          image.status === "ready"
            ? "Ready"
            : image.status === "presigning"
              ? "Preparing"
              : image.status === "uploading"
                ? `${image.progress}%`
                : image.status === "complete"
                  ? "Uploaded"
                  : "Failed";

        return (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          >
            <img
              src={image.previewUrl}
              alt={image.file.name}
              className="h-32 w-full object-cover"
            />

            <button
              type="button"
              onClick={() => onRemoveSelectedImage(image.id)}
              disabled={isUploading}
              className="absolute inset-0 hidden items-center justify-center bg-black/55 text-xs font-black text-white transition group-hover:flex disabled:cursor-not-allowed disabled:bg-black/35"
            >
              {isUploading ? "Uploading..." : "Deselect Image"}
            </button>

            <div className="absolute inset-x-0 bottom-0 bg-black/65 px-2 py-1.5 text-white">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-semibold">
                  {image.file.name}
                </span>

                <span className="shrink-0 text-[10px] font-bold">
                  {statusLabel}
                </span>
              </div>

              {image.status !== "ready" && (
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className={`h-full rounded-full ${
                      image.status === "error" ? "bg-red-400" : "bg-[#86b817]"
                    }`}
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
              )}

              {image.error && (
                <p className="mt-1 truncate text-[10px] font-semibold text-red-200">
                  {image.error}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}