import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant: 'list-cards' | 'list-items' | 'members' | 'profile';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant,
  count = 3,
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      aria-busy="true"
      aria-label="Loading"
    >
      {variant === 'list-cards' &&
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      {variant === 'list-items' &&
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      {variant === 'members' &&
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      {variant === 'profile' && (
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full max-w-xs mt-4" />
          <Skeleton className="h-10 w-full max-w-xs" />
        </div>
      )}
    </div>
  );
}
