import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, ReceiptStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ReceiptsService } from './receipts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OcrService, ParsedReceiptData } from './ocr.service';
import { ProductMatchingService } from '../products/product-matching.service';
import { AuthUser } from '../auth/auth.types';

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  let prisma: DeepMockProxy<PrismaClient>;
  let storageService: jest.Mocked<StorageService>;
  let ocrService: jest.Mocked<OcrService>;
  let productMatchingService: jest.Mocked<ProductMatchingService>;

  const adminUser: AuthUser = {
    id: 'user-1',
    firebaseUid: 'fb-1',
    email: 'admin@test.com',
    displayName: 'Admin',
    role: UserRole.ADMIN,
    householdId: 'household-1',
  };

  const memberUser: AuthUser = {
    id: 'user-2',
    firebaseUid: 'fb-2',
    email: 'member@test.com',
    displayName: 'Member',
    role: UserRole.MEMBER,
    householdId: 'household-1',
  };

  const noHouseholdUser: AuthUser = {
    id: 'user-3',
    firebaseUid: 'fb-3',
    email: 'new@test.com',
    displayName: 'New User',
    role: UserRole.MEMBER,
    householdId: null,
  };

  const mockFile = {
    buffer: Buffer.from('fake-image'),
    originalname: 'receipt.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
  } as Express.Multer.File;

  const mockParsedData: ParsedReceiptData = {
    merchantName: 'Test Store',
    purchaseDate: new Date('2026-04-01'),
    items: [
      { name: 'Whole Milk 1L', quantity: 2, unitPrice: 3.5, totalPrice: 7.0 },
      { name: 'Bread', quantity: 1, unitPrice: 2.99, totalPrice: 2.99 },
    ],
    subtotal: 9.99,
    tax: 0.8,
    total: 10.79,
    rawResponse: { mock: true },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
        {
          provide: StorageService,
          useValue: {
            upload: jest
              .fn()
              .mockResolvedValue('receipts/household-1/test.jpg'),
            getSignedUrl: jest
              .fn()
              .mockResolvedValue('https://signed-url.example.com'),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: OcrService,
          useValue: {
            processReceipt: jest.fn().mockResolvedValue(mockParsedData),
          },
        },
        {
          provide: ProductMatchingService,
          useValue: {
            findMatch: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get(ReceiptsService);
    prisma = module.get(PrismaService);
    storageService = module.get(StorageService);
    ocrService = module.get(OcrService);
    productMatchingService = module.get(ProductMatchingService);
  });

  describe('upload', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.upload(noHouseholdUser, mockFile, {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        service.upload(adminUser, undefined as never, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid mime type', async () => {
      const badFile = {
        ...mockFile,
        mimetype: 'image/gif',
      } as Express.Multer.File;
      await expect(service.upload(adminUser, badFile, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for oversized file', async () => {
      const bigFile = {
        ...mockFile,
        size: 11 * 1024 * 1024,
      } as Express.Multer.File;
      await expect(service.upload(adminUser, bigFile, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upload file, process OCR, and return completed receipt', async () => {
      prisma.receipt.create.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.PENDING,
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
        userId: 'user-1',
        merchantName: null,
        purchaseDate: null,
        subtotal: null,
        tax: null,
        total: null,
        processedAt: null,
        rawOcrData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receipt.update.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.COMPLETED,
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
        userId: 'user-1',
        merchantName: 'Test Store',
        purchaseDate: new Date('2026-04-01'),
        subtotal: new Decimal('9.99'),
        tax: new Decimal('0.80'),
        total: new Decimal('10.79'),
        processedAt: new Date(),
        rawOcrData: { mock: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.category.findFirst.mockResolvedValue({
        id: 'cat-other',
        name: 'Other',
        icon: null,
        sortOrder: 99,
        createdAt: new Date(),
      });
      prisma.product.create.mockResolvedValue({
        id: 'product-new',
        householdId: 'household-1',
        name: 'Whole Milk 1L',
        categoryId: 'cat-other',
        defaultUnit: 'UNIT',
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 0,
        avgDaysBetween: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receiptItem.create.mockResolvedValue({} as never);
      prisma.receiptItem.findMany.mockResolvedValue([]);
      prisma.product.update.mockResolvedValue({} as never);

      const result = await service.upload(adminUser, mockFile, {});

      expect(storageService.upload).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
        mockFile.mimetype,
        'household-1',
      );
      expect(ocrService.processReceipt).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.mimetype,
      );
      expect(result.status).toBe('COMPLETED');
      expect(result.imageUrl).toBe('https://signed-url.example.com');
    });

    it('should use user-provided merchantName and purchaseDate over OCR', async () => {
      prisma.receipt.create.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.PENDING,
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
        userId: 'user-1',
        merchantName: 'My Store',
        purchaseDate: new Date('2026-03-15'),
        subtotal: null,
        tax: null,
        total: null,
        processedAt: null,
        rawOcrData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receipt.update.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.COMPLETED,
        merchantName: 'My Store',
        purchaseDate: new Date('2026-03-15'),
        total: new Decimal('10.79'),
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
        userId: 'user-1',
        subtotal: new Decimal('9.99'),
        tax: new Decimal('0.80'),
        processedAt: new Date(),
        rawOcrData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue({
        id: 'p-1',
        householdId: 'household-1',
        name: 'Whole Milk 1L',
        categoryId: null,
        defaultUnit: 'UNIT',
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 0,
        avgDaysBetween: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receiptItem.create.mockResolvedValue({} as never);
      prisma.receiptItem.findMany.mockResolvedValue([]);
      prisma.product.update.mockResolvedValue({} as never);

      await service.upload(adminUser, mockFile, {
        merchantName: 'My Store',
        purchaseDate: '2026-03-15',
      });

      // The second update call (COMPLETED) should use user-provided values
      const completedUpdateCall = prisma.receipt.update.mock.calls.find(
        (call) => (call[0] as { data: { status?: string } }).data.status === 'COMPLETED',
      );
      expect(completedUpdateCall).toBeDefined();
      expect(
        (completedUpdateCall![0] as { data: { merchantName: string } }).data
          .merchantName,
      ).toBe('My Store');
    });
  });

  describe('processReceipt', () => {
    it('should set status to FAILED when OCR throws', async () => {
      ocrService.processReceipt.mockRejectedValue(
        new Error('Document AI error'),
      );
      prisma.receipt.update.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.FAILED,
      } as never);

      const result = await service.processReceipt(
        'receipt-1',
        'household-1',
        Buffer.from('data'),
        'image/jpeg',
        null,
        null,
      );

      // First call: set to PROCESSING, second call: set to FAILED
      expect(prisma.receipt.update).toHaveBeenCalledTimes(2);
      const failedCall = prisma.receipt.update.mock.calls[1]![0] as {
        data: { status: string };
      };
      expect(failedCall.data.status).toBe('FAILED');
      expect(result.status).toBe('FAILED');
    });

    it('should match existing products when available', async () => {
      const existingProduct = {
        id: 'existing-product-1',
        householdId: 'household-1',
        name: 'Whole Milk',
        categoryId: 'cat-1',
        defaultUnit: 'UNIT' as const,
        averagePrice: new Decimal('3.50'),
        lastPurchasedAt: new Date('2026-03-01'),
        purchaseCount: 5,
        avgDaysBetween: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productMatchingService.findMatch.mockImplementation(
        async (_hid, name) => {
          if (name === 'Whole Milk 1L') return existingProduct;
          return null;
        },
      );
      prisma.receipt.update.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.COMPLETED,
      } as never);
      prisma.category.findFirst.mockResolvedValue({
        id: 'cat-other',
        name: 'Other',
        icon: null,
        sortOrder: 99,
        createdAt: new Date(),
      });
      prisma.product.create.mockResolvedValue({
        id: 'new-product-1',
        householdId: 'household-1',
        name: 'Bread',
        categoryId: 'cat-other',
        defaultUnit: 'UNIT',
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 0,
        avgDaysBetween: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receiptItem.create.mockResolvedValue({} as never);
      prisma.receiptItem.findMany.mockResolvedValue([]);
      prisma.product.update.mockResolvedValue({} as never);

      await service.processReceipt(
        'receipt-1',
        'household-1',
        Buffer.from('data'),
        'image/jpeg',
        null,
        null,
      );

      // First item should use existing product (no create call for it)
      const createCalls = prisma.receiptItem.create.mock.calls;
      expect(createCalls).toHaveLength(2);
      expect(
        (createCalls[0]![0] as { data: { productId: string } }).data.productId,
      ).toBe('existing-product-1');
      expect(
        (createCalls[1]![0] as { data: { productId: string } }).data.productId,
      ).toBe('new-product-1');
    });

    it('should create new products for unmatched items', async () => {
      productMatchingService.findMatch.mockResolvedValue(null);
      prisma.receipt.update.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.COMPLETED,
      } as never);
      prisma.category.findFirst.mockResolvedValue({
        id: 'cat-other',
        name: 'Other',
        icon: null,
        sortOrder: 99,
        createdAt: new Date(),
      });
      prisma.product.create.mockResolvedValue({
        id: 'new-product',
        householdId: 'household-1',
        name: 'New Product',
        categoryId: 'cat-other',
        defaultUnit: 'UNIT',
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 0,
        avgDaysBetween: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.receiptItem.create.mockResolvedValue({} as never);
      prisma.receiptItem.findMany.mockResolvedValue([]);
      prisma.product.update.mockResolvedValue({} as never);

      await service.processReceipt(
        'receipt-1',
        'household-1',
        Buffer.from('data'),
        'image/jpeg',
        null,
        null,
      );

      expect(prisma.product.create).toHaveBeenCalledTimes(2);
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            householdId: 'household-1',
            name: 'Whole Milk 1L',
            categoryId: 'cat-other',
          }),
        }),
      );
    });
  });

  describe('updateProductStats', () => {
    it('should calculate correct stats from receipt items', async () => {
      prisma.receiptItem.findMany.mockResolvedValue([
        {
          id: 'ri-1',
          receiptId: 'r-1',
          productId: 'p-1',
          name: 'Milk',
          quantity: new Decimal(1),
          unitPrice: new Decimal('3.00'),
          totalPrice: new Decimal('3.00'),
          createdAt: new Date('2026-01-15'),
          receipt: { purchaseDate: new Date('2026-01-15') },
        },
        {
          id: 'ri-2',
          receiptId: 'r-2',
          productId: 'p-1',
          name: 'Milk',
          quantity: new Decimal(1),
          unitPrice: new Decimal('3.50'),
          totalPrice: new Decimal('3.50'),
          createdAt: new Date('2026-01-22'),
          receipt: { purchaseDate: new Date('2026-01-22') },
        },
        {
          id: 'ri-3',
          receiptId: 'r-3',
          productId: 'p-1',
          name: 'Milk',
          quantity: new Decimal(2),
          unitPrice: new Decimal('4.00'),
          totalPrice: new Decimal('8.00'),
          createdAt: new Date('2026-02-05'),
          receipt: { purchaseDate: new Date('2026-02-05') },
        },
      ] as never);
      prisma.product.update.mockResolvedValue({} as never);

      await service.updateProductStats(['p-1']);

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p-1' },
          data: expect.objectContaining({
            purchaseCount: 3,
            averagePrice: new Decimal('3.50'), // (3 + 3.5 + 4) / 3
            lastPurchasedAt: new Date('2026-02-05'),
          }),
        }),
      );

      // avgDaysBetween: (7 + 14) / 2 = 10.5
      const updateData = (
        prisma.product.update.mock.calls[0]![0] as {
          data: { avgDaysBetween: number };
        }
      ).data;
      expect(updateData.avgDaysBetween).toBe(10.5);
    });

    it('should set avgDaysBetween to null with single purchase', async () => {
      prisma.receiptItem.findMany.mockResolvedValue([
        {
          id: 'ri-1',
          receiptId: 'r-1',
          productId: 'p-1',
          name: 'Milk',
          quantity: new Decimal(1),
          unitPrice: new Decimal('3.50'),
          totalPrice: new Decimal('3.50'),
          createdAt: new Date('2026-01-15'),
          receipt: { purchaseDate: new Date('2026-01-15') },
        },
      ] as never);
      prisma.product.update.mockResolvedValue({} as never);

      await service.updateProductStats(['p-1']);

      const updateData = (
        prisma.product.update.mock.calls[0]![0] as {
          data: { avgDaysBetween: number | null };
        }
      ).data;
      expect(updateData.avgDaysBetween).toBeNull();
    });

    it('should skip products with no receipt items', async () => {
      prisma.receiptItem.findMany.mockResolvedValue([]);

      await service.updateProductStats(['p-1']);

      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.updateItem(noHouseholdUser, 'r-1', 'ri-1', { name: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      prisma.receipt.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItem(adminUser, 'r-1', 'ri-1', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if item not found', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'r-1',
        householdId: 'household-1',
      } as never);
      prisma.receiptItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItem(adminUser, 'r-1', 'ri-1', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update item fields', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'r-1',
        householdId: 'household-1',
      } as never);
      prisma.receiptItem.findFirst.mockResolvedValue({
        id: 'ri-1',
        receiptId: 'r-1',
        productId: 'p-1',
        name: 'Old Name',
        quantity: new Decimal(1),
        unitPrice: new Decimal('3.00'),
        totalPrice: new Decimal('3.00'),
      } as never);
      prisma.receiptItem.update.mockResolvedValue({
        id: 'ri-1',
        name: 'Corrected Name',
        quantity: new Decimal(2),
        unitPrice: new Decimal('3.50'),
        totalPrice: new Decimal('7.00'),
        product: { id: 'p-1', name: 'Product' },
      } as never);

      const result = await service.updateItem(adminUser, 'r-1', 'ri-1', {
        name: 'Corrected Name',
        quantity: 2,
        unitPrice: 3.5,
        totalPrice: 7.0,
      });

      expect(result.name).toBe('Corrected Name');
    });

    it('should validate product belongs to household when changing productId', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'r-1',
        householdId: 'household-1',
      } as never);
      prisma.receiptItem.findFirst.mockResolvedValue({
        id: 'ri-1',
        receiptId: 'r-1',
        productId: 'p-1',
      } as never);
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItem(adminUser, 'r-1', 'ri-1', {
          productId: 'p-invalid',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update stats for both old and new products when productId changes', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'r-1',
        householdId: 'household-1',
      } as never);
      prisma.receiptItem.findFirst.mockResolvedValue({
        id: 'ri-1',
        receiptId: 'r-1',
        productId: 'old-product',
      } as never);
      prisma.product.findFirst.mockResolvedValue({
        id: 'new-product',
        householdId: 'household-1',
      } as never);
      prisma.receiptItem.update.mockResolvedValue({
        id: 'ri-1',
        productId: 'new-product',
        product: { id: 'new-product', name: 'New' },
      } as never);
      prisma.receiptItem.findMany.mockResolvedValue([]);
      prisma.product.update.mockResolvedValue({} as never);

      const spy = jest.spyOn(service, 'updateProductStats');

      await service.updateItem(adminUser, 'r-1', 'ri-1', {
        productId: 'new-product',
      });

      expect(spy).toHaveBeenCalledWith(['new-product', 'old-product']);
    });
  });

  describe('findAll', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(service.findAll(noHouseholdUser, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return paginated receipts with signed URLs', async () => {
      const mockReceipts = [
        {
          id: 'receipt-1',
          merchantName: 'Store A',
          purchaseDate: new Date(),
          total: 49.99,
          status: ReceiptStatus.COMPLETED,
          imageUrl: 'receipts/household-1/test.jpg',
          createdAt: new Date(),
          user: { id: 'user-1', displayName: 'Admin' },
        },
      ];
      prisma.receipt.findMany.mockResolvedValue(mockReceipts as never);
      prisma.receipt.count.mockResolvedValue(1 as never);

      const result = await service.findAll(adminUser, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.imageUrl).toBe('https://signed-url.example.com');
      expect(result.meta.total).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should filter by status', async () => {
      prisma.receipt.findMany.mockResolvedValue([] as never);
      prisma.receipt.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, { status: ReceiptStatus.PENDING });

      expect(prisma.receipt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ReceiptStatus.PENDING,
          }),
        }),
      );
    });

    it('should filter by date range with endDate inclusive of full day', async () => {
      prisma.receipt.findMany.mockResolvedValue([] as never);
      prisma.receipt.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      });

      const call = prisma.receipt.findMany.mock.calls[0]![0] as {
        where: { purchaseDate: { gte: Date; lte: Date } };
      };
      expect(call.where.purchaseDate.gte).toEqual(new Date('2026-04-01'));
      const endDate = call.where.purchaseDate.lte;
      expect(endDate.getTime()).toBeGreaterThan(
        new Date('2026-04-30').getTime(),
      );
      expect(endDate.getTime()).toBeLessThan(
        new Date('2026-05-01').getTime(),
      );
    });
  });

  describe('findOne', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.findOne(noHouseholdUser, 'receipt-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      prisma.receipt.findFirst.mockResolvedValue(null as never);

      await expect(service.findOne(adminUser, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return receipt with signed URL and items', async () => {
      const mockReceipt = {
        id: 'receipt-1',
        merchantName: 'Store A',
        purchaseDate: new Date(),
        subtotal: 45.5,
        tax: 3.64,
        total: 49.14,
        status: ReceiptStatus.COMPLETED,
        imageUrl: 'receipts/household-1/test.jpg',
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', displayName: 'Admin' },
        items: [
          {
            id: 'item-1',
            name: 'Whole Milk 1L',
            quantity: 2,
            unitPrice: 3.5,
            totalPrice: 7.0,
            createdAt: new Date(),
            product: { id: 'product-1', name: 'Whole Milk' },
          },
        ],
      };
      prisma.receipt.findFirst.mockResolvedValue(mockReceipt as never);

      const result = await service.findOne(adminUser, 'receipt-1');

      expect(result.id).toBe('receipt-1');
      expect(result.imageUrl).toBe('https://signed-url.example.com');
      expect(result.items).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException for non-admin user', async () => {
      await expect(
        service.remove(memberUser, 'receipt-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.remove(noHouseholdUser, 'receipt-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if receipt not found', async () => {
      prisma.receipt.findFirst.mockResolvedValue(null as never);

      await expect(service.remove(adminUser, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete DB record first, then storage (best-effort)', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'receipt-1',
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
      } as never);
      prisma.receipt.delete.mockResolvedValue({} as never);

      await service.remove(adminUser, 'receipt-1');

      expect(prisma.receipt.delete).toHaveBeenCalledWith({
        where: { id: 'receipt-1' },
      });
      expect(storageService.delete).toHaveBeenCalledWith(
        'receipts/household-1/test.jpg',
      );
    });

    it('should not fail if storage delete throws', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'receipt-1',
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
      } as never);
      prisma.receipt.delete.mockResolvedValue({} as never);
      storageService.delete.mockRejectedValueOnce(new Error('GCS error'));

      await expect(
        service.remove(adminUser, 'receipt-1'),
      ).resolves.not.toThrow();
    });
  });
});
