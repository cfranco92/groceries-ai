'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;
  maxSizeMb?: number;
  selectedFile?: File | null;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = '.jpg,.jpeg,.png,.pdf',
  maxSizeMb = 10,
  selectedFile,
  error,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const displayError = error ?? localError;

  // Revoke blob URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = useCallback(
    (file: File): boolean => {
      setLocalError(null);
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setLocalError('Invalid file type. Please upload JPEG, PNG, or PDF.');
        return false;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setLocalError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        return false;
      }
      return true;
    },
    [maxSizeMb],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;
      // Revoke previous blob URL to prevent memory leak
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      onFileSelect(file);
    },
    [validateFile, onFileSelect, previewUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalError(null);
    onFileRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (selectedFile) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-start gap-3">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- blob URL preview not compatible with next/image */
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="h-20 w-20 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-muted">
              <FileImage className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            aria-label="Remove file"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
        aria-hidden="true"
      />

      {/* Mobile: Camera + file picker */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6">
          <Camera className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-center">Photograph your receipt</p>
          <p className="text-xs text-muted-foreground text-center">Ensure good lighting</p>
          <Button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full"
            aria-label="Open camera to photograph receipt"
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />
          <span>or upload from files</span>
          <div className="flex-1 border-t" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <FileImage className="mr-2 h-4 w-4" />
          Choose File
        </Button>
        <p className="text-xs text-center text-muted-foreground">JPEG &middot; PNG &middot; PDF &middot; max 10MB</p>
      </div>

      {/* Desktop: Drag-and-drop zone */}
      <label
        className={cn(
          'hidden md:flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        aria-label="Drag and drop zone"
      >
        <Upload className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm">Drag &amp; drop your receipt here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
        <p className="text-xs text-muted-foreground">JPEG &middot; PNG &middot; PDF &middot; max 10MB</p>
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </label>

      {displayError && (
        <p className="text-sm text-destructive" role="alert">{displayError}</p>
      )}
    </div>
  );
}
