import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';
import { ReceiptStatus } from '@groceries-ai/shared-types';

describe('StatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Pending" label for PENDING status', () => {
    render(<StatusBadge status={ReceiptStatus.PENDING} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders "Processing" label for PROCESSING status', () => {
    render(<StatusBadge status={ReceiptStatus.PROCESSING} />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders "Completed" label for COMPLETED status', () => {
    render(<StatusBadge status={ReceiptStatus.COMPLETED} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders "Failed" label for FAILED status', () => {
    render(<StatusBadge status={ReceiptStatus.FAILED} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('has aria-label "Status: Pending" for PENDING', () => {
    render(<StatusBadge status={ReceiptStatus.PENDING} />);
    expect(screen.getByLabelText('Status: Pending')).toBeInTheDocument();
  });

  it('has aria-label "Status: Processing" for PROCESSING', () => {
    render(<StatusBadge status={ReceiptStatus.PROCESSING} />);
    expect(screen.getByLabelText('Status: Processing')).toBeInTheDocument();
  });

  it('has aria-label "Status: Completed" for COMPLETED', () => {
    render(<StatusBadge status={ReceiptStatus.COMPLETED} />);
    expect(screen.getByLabelText('Status: Completed')).toBeInTheDocument();
  });

  it('has aria-label "Status: Failed" for FAILED', () => {
    render(<StatusBadge status={ReceiptStatus.FAILED} />);
    expect(screen.getByLabelText('Status: Failed')).toBeInTheDocument();
  });

  it('shows animate-spin class for PROCESSING status icon', () => {
    const { container } = render(<StatusBadge status={ReceiptStatus.PROCESSING} />);
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain('animate-spin');
  });

  it('does not show animate-spin class for COMPLETED status icon', () => {
    const { container } = render(<StatusBadge status={ReceiptStatus.COMPLETED} />);
    const svg = container.querySelector('svg');
    const classes = svg?.className.baseVal || svg?.getAttribute('class') || '';
    expect(classes).not.toContain('animate-spin');
  });

  it('does not show animate-spin class for PENDING status icon', () => {
    const { container } = render(<StatusBadge status={ReceiptStatus.PENDING} />);
    const svg = container.querySelector('svg');
    const classes = svg?.className.baseVal || svg?.getAttribute('class') || '';
    expect(classes).not.toContain('animate-spin');
  });

  it('accepts and applies custom className', () => {
    render(<StatusBadge status={ReceiptStatus.COMPLETED} className="my-custom-class" />);
    const badge = screen.getByLabelText('Status: Completed');
    expect(badge.className).toContain('my-custom-class');
  });

  it('falls back to PENDING config for unknown status', () => {
    // Cast to simulate an unknown status value
    render(<StatusBadge status={'UNKNOWN' as ReceiptStatus} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByLabelText('Status: Pending')).toBeInTheDocument();
  });
});
