'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useUploadThing } from './uploadthing';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value = [], onChange, maxFiles = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      // Extract just the URLs and add them to existing images
      if (res && res.length > 0) {
        const newUrls = res.map(file => file.url);
        onChange([...value, ...newUrls]);
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      console.error(error);
      // You could add toast notification here
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  function removeImage(index: number) {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  }

  // Function to rearrange images by drag and drop
  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= value.length) return;
    
    const newImages = [...value];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      startUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative group rounded-md overflow-hidden border border-[#D2BDA2] h-32 w-32"
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              className="object-cover h-full w-full"
              width={128}
              height={128}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {index > 0 && (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1 left-1 h-6 w-6 bg-white opacity-0 group-hover:opacity-100"
                onClick={() => moveImage(index, index - 1)}
              >
                ↑
              </Button>
            )}
            {index < value.length - 1 && (
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-1 left-1 h-6 w-6 bg-white opacity-0 group-hover:opacity-100"
                onClick={() => moveImage(index, index + 1)}
              >
                ↓
              </Button>
            )}
          </div>
        ))}

        {value.length < maxFiles && (
          <div className="h-32 w-32 border-2 border-dashed border-[#D2BDA2] rounded-md flex items-center justify-center bg-[#F7F5F6]">
            <Button 
              variant="ghost"
              className="h-full w-full flex flex-col items-center justify-center"
              disabled={isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {isUploading ? (
                <span className="text-[#95A7B5]">Uploading...</span>
              ) : (
                <span className="text-[#A76825]">+ Add Image</span>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple={maxFiles - value.length > 1}
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-[#95A7B5]">
        Upload up to {maxFiles} images. First image will be used as the main product image.
      </p>
    </div>
  );
} 