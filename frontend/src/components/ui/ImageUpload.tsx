"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface ImageUploadProps {
  images: string[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (url: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  uploading?: boolean;
}

export default function ImageUpload({
  images,
  onUpload,
  onRemove,
  disabled = false,
  maxFiles = 5,
  uploading = false,
}: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errorUrls, setErrorUrls] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string[]>([]);

  // Keep previewRef in sync for cleanup
  previewRef.current = previewUrls;

  // Revoke object URLs on unmount
  useEffect(() => {
    const urls = previewRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const totalCount = images.length + previewUrls.length;
  const showAddButton = totalCount < maxFiles;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls((prev) => [...prev, previewUrl]);

        try {
          await onUpload(file);
          // Remove preview on success
          setPreviewUrls((prev) => prev.filter((u) => u !== previewUrl));
          URL.revokeObjectURL(previewUrl);
        } catch {
          setErrorUrls((prev) => new Set(prev).add(file.name));
          setPreviewUrls((prev) => prev.filter((u) => u !== previewUrl));
          URL.revokeObjectURL(previewUrl);
        }
      }

      // Reset input value so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onUpload]
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Existing image tiles */}
        {images.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg border border-purple-200 overflow-hidden group"
          >
            <img
              src={url}
              alt={url}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label={`Remove ${url}`}
              onClick={() => onRemove(url)}
              disabled={disabled}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Uploading tile */}
        {uploading && (
          <div className="aspect-square rounded-lg border border-dashed border-purple-300 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* Preview tiles (pending upload) */}
        {previewUrls.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg border border-purple-200 overflow-hidden"
          >
            <img
              src={url}
              alt="Preview"
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          </div>
        ))}

        {/* Error tiles (from previous failed uploads) */}
        {Array.from(errorUrls).map((name) => (
          <div
            key={`error-${name}`}
            className="aspect-square rounded-lg border border-red-300 flex flex-col items-center justify-center"
          >
            <X className="h-6 w-6 text-red-500" />
            <p className="text-xs text-red-500 mt-1">Upload failed</p>
          </div>
        ))}

        {/* Add Image tile */}
        {showAddButton && (
          <button
            type="button"
            aria-label="Add Image"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-purple-300 flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="h-6 w-6 text-purple-500" />
            <span className="text-sm text-purple-500 mt-1">Add Image</span>
            <input
              ref={inputRef}
              type="file"
              data-testid="file-input"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
            />
          </button>
        )}
      </div>
      <p className="text-xs text-stone-500 mt-1">
        Max {maxFiles} images (JPEG, PNG, GIF, WebP)
      </p>
    </div>
  );
}
