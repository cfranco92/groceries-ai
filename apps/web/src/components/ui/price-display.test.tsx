import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay } from './price-display';

describe('PriceDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders formatted currency for a valid amount', () => {
    render(<PriceDisplay amount={12.5} />);
    expect(screen.getByText('$12.50')).toBeInTheDocument();
  });

  it('renders formatted currency with two decimal places', () => {
    render(<PriceDisplay amount={100} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('renders formatted currency for small amounts', () => {
    render(<PriceDisplay amount={0.99} />);
    expect(screen.getByText('$0.99')).toBeInTheDocument();
  });

  it('renders em-dash for null amount', () => {
    render(<PriceDisplay amount={null} />);
    const el = screen.getByLabelText('No price');
    expect(el).toBeInTheDocument();
    // The em-dash is the HTML entity &mdash; which renders as \u2014
    expect(el.textContent).toBe('\u2014');
  });

  it('renders em-dash for undefined amount', () => {
    render(<PriceDisplay amount={undefined} />);
    const el = screen.getByLabelText('No price');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toBe('\u2014');
  });

  it('has "No price" aria-label for null', () => {
    render(<PriceDisplay amount={null} />);
    expect(screen.getByLabelText('No price')).toBeInTheDocument();
  });

  it('does not have "No price" aria-label for valid amount', () => {
    render(<PriceDisplay amount={5.0} />);
    expect(screen.queryByLabelText('No price')).not.toBeInTheDocument();
  });

  it('renders with standard variant by default', () => {
    const { container } = render(<PriceDisplay amount={10} />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-sm');
  });

  it('renders with large variant', () => {
    const { container } = render(<PriceDisplay amount={10} variant="large" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-lg');
    expect(span?.className).toContain('font-semibold');
  });

  it('renders with muted variant', () => {
    const { container } = render(<PriceDisplay amount={10} variant="muted" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-muted-foreground');
  });

  it('shows trend-up icon for trend-up variant', () => {
    const { container } = render(<PriceDisplay amount={15} variant="trend-up" />);
    // The TrendingUp icon should be rendered as an SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // Check that destructive color class is applied
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-destructive');
  });

  it('shows trend-down icon for trend-down variant', () => {
    const { container } = render(<PriceDisplay amount={15} variant="trend-down" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
    // Check that green color class is applied
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-green-600');
  });

  it('does not show trend icon for standard variant', () => {
    const { container } = render(<PriceDisplay amount={10} variant="standard" />);
    // Only the text, no SVG icon expected for standard variant
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<PriceDisplay amount={5} className="custom-class" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('custom-class');
  });

  it('formats zero correctly', () => {
    render(<PriceDisplay amount={0} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
});
