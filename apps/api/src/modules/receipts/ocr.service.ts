import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentProcessorServiceClient,
  protos,
} from '@google-cloud/documentai';

export interface ParsedLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedReceiptData {
  merchantName: string | null;
  purchaseDate: Date | null;
  items: ParsedLineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  rawResponse: Record<string, unknown>;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly client: DocumentProcessorServiceClient | null;
  private readonly processorName: string | null;
  private readonly isMockAllowed: boolean;

  constructor(private readonly config: ConfigService) {
    const projectId = this.config.get<string>('GCP_PROJECT_ID');
    const processorId = this.config.get<string>(
      'GOOGLE_DOCUMENT_AI_PROCESSOR_ID',
    );
    const processorLocation =
      this.config.get<string>('GOOGLE_DOCUMENT_AI_LOCATION') ?? 'us';
    const nodeEnv = this.config.get<string>('NODE_ENV') ?? 'development';

    this.isMockAllowed = ['development', 'test'].includes(nodeEnv);

    if (projectId && processorId) {
      this.client = new DocumentProcessorServiceClient();
      this.processorName = `projects/${projectId}/locations/${processorLocation}/processors/${processorId}`;
      this.logger.log('OcrService initialized with Google Document AI');
    } else {
      this.client = null;
      this.processorName = null;
      if (this.isMockAllowed) {
        this.logger.warn(
          'Document AI env vars not set — using mock OCR processor (dev/test only)',
        );
      } else {
        this.logger.error(
          'Document AI env vars not set — OCR processing will fail in this environment',
        );
      }
    }
  }

  async processReceipt(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ParsedReceiptData> {
    if (!this.client || !this.processorName) {
      if (!this.isMockAllowed) {
        throw new Error(
          'Document AI is not configured and mock processor is disabled outside dev/test',
        );
      }
      return this.mockProcessReceipt();
    }

    const [result] = await this.client.processDocument({
      name: this.processorName,
      rawDocument: {
        content: imageBuffer.toString('base64'),
        mimeType,
      },
    });

    const document = result.document;
    if (!document) {
      throw new Error('Document AI returned no document');
    }

    return this.parseDocumentAiResponse(document);
  }

  private parseDocumentAiResponse(
    document: protos.google.cloud.documentai.v1.IDocument,
  ): ParsedReceiptData {
    const entities = document.entities || [];
    const rawResponse = JSON.parse(JSON.stringify(document));

    let merchantName: string | null = null;
    let purchaseDate: Date | null = null;
    let subtotal: number | null = null;
    let tax: number | null = null;
    let total: number | null = null;
    const items: ParsedLineItem[] = [];

    for (const entity of entities) {
      const type = entity.type || '';
      const text = (entity.mentionText || '').trim();

      switch (type) {
        case 'supplier_name':
          merchantName = text || null;
          break;
        case 'receipt_date': {
          const normalizedValue = entity.normalizedValue?.dateValue;
          if (normalizedValue?.year && normalizedValue?.month && normalizedValue?.day) {
            purchaseDate = new Date(
              normalizedValue.year,
              normalizedValue.month - 1,
              normalizedValue.day,
            );
          } else if (text) {
            const parsed = new Date(text);
            if (!isNaN(parsed.getTime())) {
              purchaseDate = parsed;
            }
          }
          break;
        }
        case 'net_amount':
          subtotal = this.parseAmount(text);
          break;
        case 'total_tax_amount':
          tax = this.parseAmount(text);
          break;
        case 'total_amount':
          total = this.parseAmount(text);
          break;
        case 'line_item':
          items.push(this.parseLineItem(entity));
          break;
      }
    }

    return { merchantName, purchaseDate, items, subtotal, tax, total, rawResponse };
  }

  private parseLineItem(
    entity: protos.google.cloud.documentai.v1.Document.IEntity,
  ): ParsedLineItem {
    const props = entity.properties ?? [];
    let name = '';
    let quantity = 1;
    let unitPrice = 0;
    let totalPrice = 0;

    for (const prop of props) {
      const type = prop.type || '';
      const text = (prop.mentionText || '').trim();
      switch (type) {
        case 'line_item/description':
          name = text;
          break;
        case 'line_item/quantity':
          quantity = this.parseAmount(text) ?? 1;
          break;
        case 'line_item/unit_price':
          unitPrice = this.parseAmount(text) ?? 0;
          break;
        case 'line_item/amount':
          totalPrice = this.parseAmount(text) ?? 0;
          break;
      }
    }

    // Infer missing values
    if (totalPrice > 0 && unitPrice === 0 && quantity > 0) {
      unitPrice = totalPrice / quantity;
    }
    if (unitPrice > 0 && totalPrice === 0 && quantity > 0) {
      totalPrice = unitPrice * quantity;
    }

    return { name, quantity, unitPrice, totalPrice };
  }

  /**
   * Parse a currency/number string, handling international formats:
   * - "1,234.56" (English) → 1234.56
   * - "1.234,56" (European) → 1234.56
   * - "$3.50", "€1.234,56" → stripped and parsed
   */
  parseAmount(text: string): number | null {
    const cleaned = text.replace(/[^0-9.,-]/g, '').trim();
    if (!cleaned) return null;

    const isNegative = cleaned.includes('-');
    let normalized = cleaned.replace(/-/g, '');

    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');

    if (lastComma !== -1 && lastDot !== -1) {
      // Both separators present — the later one is decimal
      const decimalSep = lastComma > lastDot ? ',' : '.';
      const thousandsSep = decimalSep === ',' ? '.' : ',';
      normalized = normalized.split(thousandsSep).join('');
      if (decimalSep === ',') {
        normalized = normalized.replace(',', '.');
      }
    } else if (lastComma !== -1) {
      const commaCount = (normalized.match(/,/g) ?? []).length;
      if (commaCount > 1) {
        // Multiple commas — all are thousands separators
        normalized = normalized.replace(/,/g, '');
      } else {
        // Single comma — check digits after it
        const decimalDigits = normalized.length - lastComma - 1;
        normalized =
          decimalDigits === 3
            ? normalized.replace(',', '') // "1,234" → thousands
            : normalized.replace(',', '.'); // "3,50" → decimal
      }
    } else if (lastDot !== -1) {
      const dotCount = (normalized.match(/\./g) ?? []).length;
      if (dotCount > 1) {
        // Multiple dots — all are thousands separators
        normalized = normalized.replace(/\./g, '');
      } else {
        // Single dot with exactly 3 trailing digits — ambiguous but treat as decimal
        // (most receipt amounts have 2 decimal digits, so 3 means thousands only for large values)
        // Keep dot as decimal separator (standard behavior)
      }
    }

    if (isNegative) {
      normalized = `-${normalized}`;
    }

    const value = Number(normalized);
    return Number.isNaN(value) ? null : value;
  }

  private mockProcessReceipt(): ParsedReceiptData {
    this.logger.log('Using mock OCR processor — returning sample data');
    return {
      merchantName: 'Mock Supermarket',
      purchaseDate: new Date(),
      items: [
        { name: 'Whole Milk 1L', quantity: 2, unitPrice: 3.5, totalPrice: 7.0 },
        { name: 'Bread Loaf', quantity: 1, unitPrice: 2.99, totalPrice: 2.99 },
        { name: 'Bananas 1kg', quantity: 1, unitPrice: 1.49, totalPrice: 1.49 },
        { name: 'Chicken Breast', quantity: 0.75, unitPrice: 8.99, totalPrice: 6.74 },
        { name: 'Rice 2kg', quantity: 1, unitPrice: 4.29, totalPrice: 4.29 },
      ],
      subtotal: 22.51,
      tax: 1.8,
      total: 24.31,
      rawResponse: { mock: true, processor: 'development-fallback' },
    };
  }
}
