import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, ReceiptStatus } from '@prisma/client';
import { ReceiptsService } from './receipts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthUser } from '../auth/auth.types';

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  let prisma: DeepMockProxy<PrismaClient>;
  let storageService: jest.Mocked<StorageService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn().mockResolvedValue('receipts/household-1/test.jpg'),
            getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ReceiptsService);
    prisma = module.get(PrismaService);
    storageService = module.get(StorageService);
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
      const badFile = { ...mockFile, mimetype: 'image/gif' } as Express.Multer.File;
      await expect(
        service.upload(adminUser, badFile, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for oversized file', async () => {
      const bigFile = { ...mockFile, size: 11 * 1024 * 1024 } as Express.Multer.File;
      await expect(
        service.upload(adminUser, bigFile, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload file and create receipt with PENDING status', async () => {
      prisma.receipt.create.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.PENDING,
        imageUrl: 'receipts/household-1/test.jpg',
      } as never);

      const result = await service.upload(adminUser, mockFile, {
        merchantName: 'Test Store',
      });

      expect(storageService.upload).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
        mockFile.mimetype,
        'household-1',
      );
      expect(prisma.receipt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            householdId: 'household-1',
            userId: 'user-1',
            status: 'PENDING',
            merchantName: 'Test Store',
          }),
        }),
      );
      expect(result.id).toBe('receipt-1');
      expect(result.status).toBe('PENDING');
      expect(result.imageUrl).toBe('https://signed-url.example.com');
    });

    it('should set purchaseDate when provided', async () => {
      prisma.receipt.create.mockResolvedValue({
        id: 'receipt-1',
        status: ReceiptStatus.PENDING,
        imageUrl: 'receipts/household-1/test.jpg',
      } as never);

      await service.upload(adminUser, mockFile, {
        purchaseDate: '2026-04-03',
      });

      expect(prisma.receipt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            purchaseDate: new Date('2026-04-03'),
          }),
        }),
      );
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

    it('should filter by date range', async () => {
      prisma.receipt.findMany.mockResolvedValue([] as never);
      prisma.receipt.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      });

      expect(prisma.receipt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            purchaseDate: {
              gte: new Date('2026-04-01'),
              lte: new Date('2026-04-30'),
            },
          }),
        }),
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

      await expect(
        service.findOne(adminUser, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
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

      await expect(
        service.remove(adminUser, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete file from storage and receipt from DB', async () => {
      prisma.receipt.findFirst.mockResolvedValue({
        id: 'receipt-1',
        imageUrl: 'receipts/household-1/test.jpg',
        householdId: 'household-1',
      } as never);
      prisma.receipt.delete.mockResolvedValue({} as never);

      await service.remove(adminUser, 'receipt-1');

      expect(storageService.delete).toHaveBeenCalledWith(
        'receipts/household-1/test.jpg',
      );
      expect(prisma.receipt.delete).toHaveBeenCalledWith({
        where: { id: 'receipt-1' },
      });
    });
  });
});
