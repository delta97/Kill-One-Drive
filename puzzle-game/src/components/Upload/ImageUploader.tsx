import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePuzzleStore } from '../../store';
import { Button } from '../shared';

interface ImageUploaderProps {
  onUploadComplete: () => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const setImage = usePuzzleStore((state) => state.setImage);
  const imageUrl = usePuzzleStore((state) => state.imageUrl);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }

      setImage(file);
    },
    [setImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  return (
    <div className="w-full max-w-2xl">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 md:p-16
            transition-colors cursor-pointer
            ${
              isDragActive
                ? 'border-puzzle-primary bg-blue-50'
                : 'border-gray-300 hover:border-puzzle-primary hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="w-16 h-16 md:w-20 md:h-20 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              {isDragActive ? 'Drop your image here' : 'Drop an image here'}
            </p>
            <p className="text-sm md:text-base text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, WebP (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="w-full h-auto max-h-96 object-contain bg-gray-100"
            />
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setImage(null as any);
                setError(null);
              }}
              variant="outline"
            >
              Choose Different Image
            </Button>
            <Button onClick={onUploadComplete}>Continue</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
