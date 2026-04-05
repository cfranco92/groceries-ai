import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReceiptSummary } from './index';

describe('ReceiptSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Subtotal" label', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
  });

  it('renders "Tax" label', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('Tax')).toBeInTheDocument();
  });

  it('renders "Total" label', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders formatted subtotal', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('$40.00')).toBeInTheDocument();
  });

  it('renders formatted tax', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('$3.20')).toBeInTheDocument();
  });

  it('renders formatted total', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    expect(screen.getByText('$43.20')).toBeInTheDocument();
  });

  it('handles null subtotal gracefully', () => {
    render(<ReceiptSummary subtotal={null} tax={3.2} total={43.2} />);
    // Should show em-dash for null subtotal
    const noPriceElements = screen.getAllByLabelText('No price');
    expect(noPriceElements.length).toBeGreaterThanOrEqual(1);
  });

  it('handles null tax gracefully', () => {
    render(<ReceiptSummary subtotal={40.0} tax={null} total={43.2} />);
    const noPriceElements = screen.getAllByLabelText('No price');
    expect(noPriceElements.length).toBeGreaterThanOrEqual(1);
  });

  it('handles null total gracefully', () => {
    render(<ReceiptSummary subtotal={40.0} tax={3.2} total={null} />);
    const noPriceElements = screen.getAllByLabelText('No price');
    expect(noPriceElements.length).toBeGreaterThanOrEqual(1);
  });

  it('handles all null values gracefully', () => {
    render(<ReceiptSummary subtotal={null} tax={null} total={null} />);
    const noPriceElements = screen.getAllByLabelText('No price');
    expect(noPriceElements).toHaveLength(3);
  });

  it('renders total with large variant styling', () => {
    const { container } = render(<ReceiptSummary subtotal={40.0} tax={3.2} total={43.2} />);
    // The total PriceDisplay uses variant="large" which adds text-lg and font-semibold
    const totalSpan = container.querySelector('.text-lg.font-semibold');
    expect(totalSpan).toBeInTheDocument();
    expect(totalSpan?.textContent).toBe('$43.20');
  });
});
