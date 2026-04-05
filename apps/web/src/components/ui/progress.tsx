"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const hasValidMax = Number.isFinite(max) && max > 0;
    const percentage = hasValidMax
      ? Math.min(Math.max((safeValue / max) * 100, 0), 100)
      : 0;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          className,
        )}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
