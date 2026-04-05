import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './index';
import type { Product, Category } from '@groceries-ai/shared-types';
import { UnitType } from '@groceries-ai/shared-types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Fruits',
  icon: 'apple',
};

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Organic Bananas',
    categoryId: 'cat-1',
    householdId: 'hh-1',
    defaultUnit: UnitType.UNIT,
    avgPrice: 2.49,
    lastPurchasedAt: '2026-04-01T00:00:00Z',
    purchaseCount: 5,
    avgDaysBetweenPurchases: 7,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  };
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product name', () => {
    render(<ProductCard product={createProduct()} category={mockCategory} />);
    expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
  });

  it('renders category name', () => {
    render(<ProductCard product={createProduct()} category={mockCategory} />);
    expect(screen.getByText('Fruits')).toBeInTheDocument();
  });

  it('renders price using PriceDisplay', () => {
    render(<ProductCard product={createProduct({ avgPrice: 2.49 })} category={mockCategory} />);
    expect(screen.getByText('$2.49')).toBeInTheDocument();
  });

  it('renders purchase count', () => {
    render(<ProductCard product={createProduct({ purchaseCount: 5 })} category={mockCategory} />);
    // The text includes the multiplication sign entity
    const purchaseEl = screen.getByText((content) => content.includes('Purchased 5'));
    expect(purchaseEl).toBeInTheDocument();
  });

  it('links to product detail page', () => {
    render(<ProductCard product={createProduct({ id: 'prod-42' })} category={mockCategory} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/prod-42');
  });

  it('renders "Not yet purchased" for null lastPurchasedAt', () => {
    render(
      <ProductCard
        product={createProduct({ lastPurchasedAt: null })}
        category={mockCategory}
      />,
    );
    expect(screen.getByText('Not yet purchased')).toBeInTheDocument();
  });

  it('has accessible label with product name and category', () => {
    render(<ProductCard product={createProduct()} category={mockCategory} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Organic Bananas, Fruits');
  });

  it('renders "Uncategorized" when category is undefined', () => {
    render(<ProductCard product={createProduct()} />);
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('has accessible label with "Uncategorized" when no category', () => {
    render(<ProductCard product={createProduct()} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Organic Bananas, Uncategorized');
  });

  it('renders em-dash for null avgPrice', () => {
    render(
      <ProductCard
        product={createProduct({ avgPrice: null })}
        category={mockCategory}
      />,
    );
    const noPriceEl = screen.getByLabelText('No price');
    expect(noPriceEl).toBeInTheDocument();
  });

  it('renders "Today" for purchases made today', () => {
    const today = new Date().toISOString();
    render(
      <ProductCard
        product={createProduct({ lastPurchasedAt: today })}
        category={mockCategory}
      />,
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});
