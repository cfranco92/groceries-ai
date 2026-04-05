'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  return (
    <div className={cn('relative rounded-lg border overflow-hidden bg-muted', className)}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external receipt image URL with zoom/pan not compatible with next/image */}
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain"
                role="img"
              />
            </TransformComponent>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border bg-background/90 px-2 py-1 shadow-sm backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => zoomOut()}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => resetTransform()}
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => zoomIn()}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
