'use client';

import {
  Apple,
  Milk,
  Beef,
  Croissant,
  Coffee,
  Candy,
  Sparkles,
  Heart,
  Snowflake,
  Archive,
  Wheat,
  FlaskConical,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@groceries-ai/shared-types';

const categoryIconMap: Record<string, React.ElementType> = {
  apple: Apple,
  milk: Milk,
  beef: Beef,
  croissant: Croissant,
  coffee: Coffee,
  candy: Candy,
  sparkles: Sparkles,
  heart: Heart,
  snowflake: Snowflake,
  archive: Archive,
  wheat: Wheat,
  flask: FlaskConical,
};

export function getCategoryIcon(iconName?: string | null): React.ElementType {
  if (!iconName) return MoreHorizontal;
  return categoryIconMap[iconName.toLowerCase()] ?? MoreHorizontal;
}

interface CategoryChipProps {
  category: Pick<Category, 'id' | 'name' | 'icon'>;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ category, isActive, onClick }: CategoryChipProps) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'border bg-background text-foreground hover:bg-muted',
      )}
    >
      <Icon className="h-4 w-4" />
      {category.name}
    </button>
  );
}
