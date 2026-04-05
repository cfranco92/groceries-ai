import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReceiptCard } from './index';
import type { Receipt } from '@groceries-ai/shared-types';
import { ReceiptStatus } from '@groceries-ai/shared-types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

/** Format a date string exactly as the component does, so tests are timezone-safe. */
function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PURCHASE_DATE = '2026-03-15T12:00:00Z';
const CREATED_DATE = '2026-03-15T12:00:00Z';
const FALLBACK_CREATED_DATE = '2026-04-01T12:00:00Z';

function createReceipt(overrides: Partial<Receipt & { itemCount?: number }> = {}): Receipt & { itemCount?: number } {
  return {
    id: 'rcpt-1',
    householdId: 'hh-1',
    userId: 'user-1',
    imageUrl: '',
    merchantName: 'Whole Foods',
    purchaseDate: PURCHASE_DATE,
    subtotal: 45.00,
    tax: 3.60,
    total: 48.60,
    status: ReceiptStatus.COMPLETED,
    processedAt: '2026-03-15T13:00:00Z',
    rawOcrData: null,
    createdAt: CREATED_DATE,
    updatedAt: '2026-03-15T13:00:00Z',
    ...overrides,
  };
}

describe('ReceiptCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders merchant name', () => {
    render(<ReceiptCard receipt={createReceipt()} />);
    expect(screen.getByText('Whole Foods')).toBeInTheDocument();
  });

  it('renders formatted purchase date', () => {
    render(<ReceiptCard receipt={createReceipt()} />);
    const expectedDate = formatDate(PURCHASE_DATE);
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('renders StatusBadge with COMPLETED status', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED })} />);
    expect(screen.getByLabelText('Status: Completed')).toBeInTheDocument();
  });

  it('renders StatusBadge with PENDING status', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.PENDING })} />);
    expect(screen.getByLabelText('Status: Pending')).toBeInTheDocument();
  });

  it('renders StatusBadge with PROCESSING status', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.PROCESSING })} />);
    expect(screen.getByLabelText('Status: Processing')).toBeInTheDocument();
  });

  it('renders StatusBadge with FAILED status', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.FAILED })} />);
    expect(screen.getByLabelText('Status: Failed')).toBeInTheDocument();
  });

  it('shows total for COMPLETED receipts', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED, total: 48.60 })} />);
    expect(screen.getByText('$48.60')).toBeInTheDocument();
  });

  it('shows item count for COMPLETED receipts with itemCount', () => {
    render(
      <ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED, itemCount: 12 })} />,
    );
    expect(screen.getByText('12 items')).toBeInTheDocument();
  });

  it('shows "Processing..." for PROCESSING receipts', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.PROCESSING })} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('does not show "Processing..." for COMPLETED receipts', () => {
    render(<ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED })} />);
    expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
  });

  it('does not show total for PROCESSING receipts', () => {
    render(
      <ReceiptCard
        receipt={createReceipt({ status: ReceiptStatus.PROCESSING, total: 48.60 })}
      />,
    );
    expect(screen.queryByText('$48.60')).not.toBeInTheDocument();
  });

  it('links to receipt detail page', () => {
    render(<ReceiptCard receipt={createReceipt({ id: 'rcpt-42' })} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/receipts/rcpt-42');
  });

  it('has accessible label with merchant, date, and status', () => {
    render(
      <ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED })} />,
    );
    const article = screen.getByRole('article');
    const expectedDate = formatDate(PURCHASE_DATE);
    expect(article).toHaveAttribute(
      'aria-label',
      `Whole Foods, ${expectedDate}, COMPLETED`,
    );
  });

  it('renders "Unknown Merchant" when merchantName is null', () => {
    render(
      <ReceiptCard receipt={createReceipt({ merchantName: null })} />,
    );
    expect(screen.getByText('Unknown Merchant')).toBeInTheDocument();
  });

  it('falls back to createdAt date when purchaseDate is null', () => {
    render(
      <ReceiptCard
        receipt={createReceipt({
          purchaseDate: null,
          createdAt: FALLBACK_CREATED_DATE,
        })}
      />,
    );
    const expectedDate = formatDate(FALLBACK_CREATED_DATE);
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('does not show item count when itemCount is not provided', () => {
    render(
      <ReceiptCard receipt={createReceipt({ status: ReceiptStatus.COMPLETED, itemCount: undefined })} />,
    );
    expect(screen.queryByText(/items/)).not.toBeInTheDocument();
  });
});
