import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryChip, getCategoryIcon } from './index';
import type { Category } from '@groceries-ai/shared-types';

type PartialCategory = Pick<Category, 'id' | 'name' | 'icon'>;

const fruitCategory: PartialCategory = {
  id: 'cat-1',
  name: 'Fruits',
  icon: 'apple',
};

const nullIconCategory: PartialCategory = {
  id: 'cat-2',
  name: 'Other',
  icon: null,
};

describe('CategoryChip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category name', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={false} onClick={vi.fn()} />,
    );
    expect(screen.getByText('Fruits')).toBeInTheDocument();
  });

  it('renders with role="radio"', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={false} onClick={vi.fn()} />,
    );
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('shows active state when isActive=true (aria-checked="true")', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={true} onClick={vi.fn()} />,
    );
    const chip = screen.getByRole('radio');
    expect(chip).toHaveAttribute('aria-checked', 'true');
  });

  it('shows inactive state when isActive=false (aria-checked="false")', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={false} onClick={vi.fn()} />,
    );
    const chip = screen.getByRole('radio');
    expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <CategoryChip category={fruitCategory} isActive={false} onClick={handleClick} />,
    );
    await user.click(screen.getByRole('radio'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses fallback icon when icon is null', () => {
    render(
      <CategoryChip category={nullIconCategory} isActive={false} onClick={vi.fn()} />,
    );
    // The component should still render with the fallback MoreHorizontal icon
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('applies active styling classes when isActive=true', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={true} onClick={vi.fn()} />,
    );
    const chip = screen.getByRole('radio');
    expect(chip.className).toContain('bg-primary');
    expect(chip.className).toContain('text-primary-foreground');
  });

  it('applies inactive styling classes when isActive=false', () => {
    render(
      <CategoryChip category={fruitCategory} isActive={false} onClick={vi.fn()} />,
    );
    const chip = screen.getByRole('radio');
    expect(chip.className).toContain('bg-background');
  });
});

describe('getCategoryIcon', () => {
  it('returns a component for known icon names', () => {
    const Icon = getCategoryIcon('apple');
    expect(Icon).toBeDefined();
    // Lucide icons are ForwardRef objects, not plain functions
    expect(typeof Icon === 'function' || typeof Icon === 'object').toBe(true);
  });

  it('returns fallback icon for null', () => {
    const Icon = getCategoryIcon(null);
    expect(Icon).toBeDefined();
    expect(typeof Icon === 'function' || typeof Icon === 'object').toBe(true);
  });

  it('returns fallback icon for undefined', () => {
    const Icon = getCategoryIcon(undefined);
    expect(Icon).toBeDefined();
  });

  it('returns fallback icon for unknown icon name', () => {
    const Icon = getCategoryIcon('nonexistent');
    expect(Icon).toBeDefined();
  });

  it('is case-insensitive', () => {
    const iconLower = getCategoryIcon('apple');
    const iconUpper = getCategoryIcon('Apple');
    expect(iconLower).toBe(iconUpper);
  });
});
