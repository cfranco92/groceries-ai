import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './index';

// Mock URL.createObjectURL / revokeObjectURL which are not available in jsdom
const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/fake-preview');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  globalThis.URL.createObjectURL = mockCreateObjectURL;
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Helper: simulate a file being selected on a hidden file input via fireEvent.
 * userEvent.upload does not reliably trigger onChange for hidden inputs with aria-hidden.
 */
function simulateFileSelect(input: HTMLInputElement, file: File) {
  // Create a new FileList-like object with the file
  Object.defineProperty(input, 'files', {
    value: [file],
    writable: false,
    configurable: true,
  });
  fireEvent.change(input);
}

describe('FileUpload', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnFileRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:http://localhost/fake-preview');
  });

  function renderUpload(overrides: Partial<Parameters<typeof FileUpload>[0]> = {}) {
    return render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        onFileRemove={mockOnFileRemove}
        {...overrides}
      />,
    );
  }

  it('renders upload zone with instructions', () => {
    renderUpload();
    expect(screen.getByLabelText('Drag and drop zone')).toBeInTheDocument();
  });

  it('renders camera button for mobile', () => {
    renderUpload();
    expect(screen.getByLabelText('Open camera to photograph receipt')).toBeInTheDocument();
  });

  it('renders file type info', () => {
    renderUpload();
    const infoElements = screen.getAllByText((content) =>
      content.includes('JPEG') && content.includes('PNG') && content.includes('PDF'),
    );
    expect(infoElements.length).toBeGreaterThan(0);
  });

  it('shows error for invalid file type', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
    simulateFileSelect(fileInput, invalidFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid file type. Please upload JPEG, PNG, or PDF.',
    );
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('shows error for files exceeding max size', () => {
    renderUpload({ maxSizeMb: 1 });

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const largeContent = new Uint8Array(1.5 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large-receipt.jpg', {
      type: 'image/jpeg',
    });

    simulateFileSelect(fileInput, largeFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'File is too large. Maximum size is 1MB.',
    );
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('calls onFileSelect for valid JPEG file', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const validFile = new File(['image data'], 'receipt.jpg', {
      type: 'image/jpeg',
    });

    simulateFileSelect(fileInput, validFile);

    expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
  });

  it('calls onFileSelect for valid PDF file', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const pdfFile = new File(['pdf data'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    simulateFileSelect(fileInput, pdfFile);

    expect(mockOnFileSelect).toHaveBeenCalledWith(pdfFile);
  });

  it('calls onFileSelect for valid PNG file', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const pngFile = new File(['png data'], 'receipt.png', {
      type: 'image/png',
    });

    simulateFileSelect(fileInput, pngFile);

    expect(mockOnFileSelect).toHaveBeenCalledWith(pngFile);
  });

  it('shows file name and size after selection', () => {
    const file = new File(['image data'], 'my-receipt.jpg', {
      type: 'image/jpeg',
    });

    renderUpload({ selectedFile: file });

    expect(screen.getByText('my-receipt.jpg')).toBeInTheDocument();
    expect(screen.getByText('10 B')).toBeInTheDocument();
  });

  it('shows file name for image file when selected', () => {
    const file = new File(['image data'], 'receipt.png', {
      type: 'image/png',
    });

    renderUpload({ selectedFile: file });

    expect(screen.getByText('receipt.png')).toBeInTheDocument();
  });

  it('shows remove button when file is selected', () => {
    const file = new File(['data'], 'receipt.jpg', { type: 'image/jpeg' });
    renderUpload({ selectedFile: file });

    expect(screen.getByLabelText('Remove file')).toBeInTheDocument();
  });

  it('calls onFileRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const file = new File(['data'], 'receipt.jpg', { type: 'image/jpeg' });
    renderUpload({ selectedFile: file });

    await user.click(screen.getByLabelText('Remove file'));

    expect(mockOnFileRemove).toHaveBeenCalledTimes(1);
  });

  it('displays external error prop', () => {
    renderUpload({ error: 'Upload failed. Try again.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed. Try again.');
  });

  it('shows file size in KB for files between 1KB and 1MB', () => {
    const content = new Uint8Array(2048);
    const file = new File([content], 'medium.jpg', { type: 'image/jpeg' });
    renderUpload({ selectedFile: file });
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('shows file size in MB for files over 1MB', () => {
    const content = new Uint8Array(2 * 1024 * 1024);
    const file = new File([content], 'big.jpg', { type: 'image/jpeg' });
    renderUpload({ selectedFile: file });
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
  });

  it('does not show error when no error exists', () => {
    renderUpload();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('creates blob URL for image files via createObjectURL', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const imageFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    simulateFileSelect(fileInput, imageFile);

    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('does not create blob URL for PDF files', () => {
    renderUpload();

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fileInput = fileInputs[0] as HTMLInputElement;

    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    simulateFileSelect(fileInput, pdfFile);

    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it('does not show upload zone when a file is selected', () => {
    const file = new File(['data'], 'receipt.jpg', { type: 'image/jpeg' });
    renderUpload({ selectedFile: file });

    expect(screen.queryByLabelText('Drag and drop zone')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Open camera to photograph receipt')).not.toBeInTheDocument();
  });

  it('shows upload zone when no file is selected', () => {
    renderUpload({ selectedFile: undefined });

    expect(screen.getByLabelText('Drag and drop zone')).toBeInTheDocument();
  });
});
