import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OcrService } from './ocr.service';

// Mock the Document AI client
jest.mock('@google-cloud/documentai', () => ({
  DocumentProcessorServiceClient: jest.fn().mockImplementation(() => ({
    processDocument: jest.fn(),
  })),
}));

describe('OcrService', () => {
  describe('mock mode (no env vars)', () => {
    let service: OcrService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      service = module.get(OcrService);
    });

    it('should return mock data when Document AI is not configured', async () => {
      const result = await service.processReceipt(
        Buffer.from('fake-image'),
        'image/jpeg',
      );

      expect(result.merchantName).toBe('Mock Supermarket');
      expect(result.items).toHaveLength(5);
      expect(result.total).toBe(24.31);
      expect(result.subtotal).toBe(22.51);
      expect(result.tax).toBe(1.8);
      expect(result.purchaseDate).toBeInstanceOf(Date);
      expect(result.rawResponse).toEqual({
        mock: true,
        processor: 'development-fallback',
      });
    });

    it('should return items with valid name, quantity, unitPrice, totalPrice', async () => {
      const result = await service.processReceipt(
        Buffer.from('fake'),
        'image/png',
      );

      for (const item of result.items) {
        expect(item.name).toBeTruthy();
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitPrice).toBeGreaterThan(0);
        expect(item.totalPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('Document AI mode', () => {
    let service: OcrService;
    let mockProcessDocument: jest.Mock;

    beforeEach(async () => {
      // Reset the mock
      const { DocumentProcessorServiceClient } = jest.requireMock(
        '@google-cloud/documentai',
      );
      mockProcessDocument = jest.fn();
      DocumentProcessorServiceClient.mockImplementation(() => ({
        processDocument: mockProcessDocument,
      }));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string) => {
                if (key === 'GCP_PROJECT_ID') return 'test-project';
                if (key === 'GOOGLE_DOCUMENT_AI_PROCESSOR_ID')
                  return 'test-processor';
                return undefined;
              }),
            },
          },
        ],
      }).compile();

      service = module.get(OcrService);
    });

    it('should parse Document AI response with full receipt data', async () => {
      mockProcessDocument.mockResolvedValue([
        {
          document: {
            entities: [
              { type: 'supplier_name', mentionText: 'Walmart' },
              {
                type: 'receipt_date',
                mentionText: '2026-03-15',
                normalizedValue: {
                  dateValue: { year: 2026, month: 3, day: 15 },
                },
              },
              { type: 'net_amount', mentionText: '$45.50' },
              { type: 'total_tax_amount', mentionText: '$3.64' },
              { type: 'total_amount', mentionText: '$49.14' },
              {
                type: 'line_item',
                properties: [
                  { type: 'line_item/description', mentionText: 'Milk 1L' },
                  { type: 'line_item/quantity', mentionText: '2' },
                  { type: 'line_item/unit_price', mentionText: '$3.50' },
                  { type: 'line_item/amount', mentionText: '$7.00' },
                ],
              },
              {
                type: 'line_item',
                properties: [
                  { type: 'line_item/description', mentionText: 'Bread' },
                  { type: 'line_item/quantity', mentionText: '1' },
                  { type: 'line_item/unit_price', mentionText: '$2.99' },
                  { type: 'line_item/amount', mentionText: '$2.99' },
                ],
              },
            ],
          },
        },
      ]);

      const result = await service.processReceipt(
        Buffer.from('image-data'),
        'image/jpeg',
      );

      expect(result.merchantName).toBe('Walmart');
      expect(result.purchaseDate).toEqual(new Date(2026, 2, 15));
      expect(result.subtotal).toBe(45.5);
      expect(result.tax).toBe(3.64);
      expect(result.total).toBe(49.14);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        name: 'Milk 1L',
        quantity: 2,
        unitPrice: 3.5,
        totalPrice: 7.0,
      });
      expect(result.items[1]).toEqual({
        name: 'Bread',
        quantity: 1,
        unitPrice: 2.99,
        totalPrice: 2.99,
      });
      expect(result.rawResponse).toBeDefined();
    });

    it('should infer unitPrice from totalPrice and quantity', async () => {
      mockProcessDocument.mockResolvedValue([
        {
          document: {
            entities: [
              {
                type: 'line_item',
                properties: [
                  { type: 'line_item/description', mentionText: 'Eggs' },
                  { type: 'line_item/quantity', mentionText: '2' },
                  { type: 'line_item/amount', mentionText: '$6.00' },
                ],
              },
            ],
          },
        },
      ]);

      const result = await service.processReceipt(
        Buffer.from('data'),
        'image/jpeg',
      );

      expect(result.items[0]!.unitPrice).toBe(3);
      expect(result.items[0]!.totalPrice).toBe(6);
    });

    it('should infer totalPrice from unitPrice and quantity', async () => {
      mockProcessDocument.mockResolvedValue([
        {
          document: {
            entities: [
              {
                type: 'line_item',
                properties: [
                  { type: 'line_item/description', mentionText: 'Apples' },
                  { type: 'line_item/quantity', mentionText: '3' },
                  { type: 'line_item/unit_price', mentionText: '$1.50' },
                ],
              },
            ],
          },
        },
      ]);

      const result = await service.processReceipt(
        Buffer.from('data'),
        'image/jpeg',
      );

      expect(result.items[0]!.unitPrice).toBe(1.5);
      expect(result.items[0]!.totalPrice).toBe(4.5);
    });

    it('should throw when Document AI returns no document', async () => {
      mockProcessDocument.mockResolvedValue([{ document: null }]);

      await expect(
        service.processReceipt(Buffer.from('data'), 'image/jpeg'),
      ).rejects.toThrow('Document AI returned no document');
    });

    it('should handle missing entities gracefully', async () => {
      mockProcessDocument.mockResolvedValue([
        { document: { entities: [] } },
      ]);

      const result = await service.processReceipt(
        Buffer.from('data'),
        'image/jpeg',
      );

      expect(result.merchantName).toBeNull();
      expect(result.purchaseDate).toBeNull();
      expect(result.items).toHaveLength(0);
      expect(result.subtotal).toBeNull();
      expect(result.tax).toBeNull();
      expect(result.total).toBeNull();
    });

    it('should fallback to text parsing for receipt_date without normalizedValue', async () => {
      mockProcessDocument.mockResolvedValue([
        {
          document: {
            entities: [
              {
                type: 'receipt_date',
                mentionText: '2026-01-20',
                normalizedValue: null,
              },
            ],
          },
        },
      ]);

      const result = await service.processReceipt(
        Buffer.from('data'),
        'image/jpeg',
      );

      expect(result.purchaseDate).toEqual(new Date('2026-01-20'));
    });
  });
});
