import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, UnitType } from '@prisma/client';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: DeepMockProxy<PrismaClient>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(ProductsService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(service.findAll(noHouseholdUser, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Whole Milk',
          defaultUnit: UnitType.UNIT,
          averagePrice: null,
          lastPurchasedAt: null,
          purchaseCount: 0,
          createdAt: new Date(),
          category: { id: 'cat-1', name: 'Dairy', icon: null },
        },
      ];
      prisma.product.findMany.mockResolvedValue(mockProducts as never);
      prisma.product.count.mockResolvedValue(1 as never);

      const result = await service.findAll(adminUser, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should apply search filter (case-insensitive contains)', async () => {
      prisma.product.findMany.mockResolvedValue([] as never);
      prisma.product.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, { search: 'milk' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'milk', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter by categoryId', async () => {
      prisma.product.findMany.mockResolvedValue([] as never);
      prisma.product.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, { categoryId: 'cat-1' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        }),
      );
    });

    it('should respect sortBy parameter', async () => {
      prisma.product.findMany.mockResolvedValue([] as never);
      prisma.product.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, {
        sortBy: 'purchaseCount',
        sortOrder: 'desc',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { purchaseCount: 'desc' },
        }),
      );
    });

    it('should calculate hasNextPage correctly', async () => {
      prisma.product.findMany.mockResolvedValue(
        Array(20).fill({ id: 'p', name: 'Product' }) as never,
      );
      prisma.product.count.mockResolvedValue(25 as never);

      const result = await service.findAll(adminUser, { page: 1, limit: 20 });

      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.findOne(noHouseholdUser, 'product-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);

      await expect(
        service.findOne(adminUser, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return product with purchase history', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Whole Milk',
        defaultUnit: UnitType.UNIT,
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 5,
        avgDaysBetween: 7.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-1', name: 'Dairy', icon: null },
        receiptItems: [],
      };
      prisma.product.findFirst.mockResolvedValue(mockProduct as never);

      const result = await service.findOne(adminUser, 'product-1');

      expect(result.id).toBe('product-1');
      expect(result.purchaseCount).toBe(5);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException for non-admin user', async () => {
      await expect(
        service.update(memberUser, 'product-1', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.update(noHouseholdUser, 'product-1', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);

      await expect(
        service.update(adminUser, 'nonexistent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category not found', async () => {
      prisma.product.findFirst.mockResolvedValue({
        id: 'product-1',
        householdId: 'household-1',
      } as never);
      prisma.category.findUnique.mockResolvedValue(null as never);

      await expect(
        service.update(adminUser, 'product-1', { categoryId: 'bad-cat' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update product successfully', async () => {
      prisma.product.findFirst.mockResolvedValue({
        id: 'product-1',
        householdId: 'household-1',
      } as never);

      const updatedProduct = {
        id: 'product-1',
        name: 'Updated Milk',
        defaultUnit: UnitType.L,
        averagePrice: null,
        lastPurchasedAt: null,
        purchaseCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-1', name: 'Dairy', icon: null },
      };
      prisma.product.update.mockResolvedValue(updatedProduct as never);

      const result = await service.update(adminUser, 'product-1', {
        name: 'Updated Milk',
        defaultUnit: UnitType.L,
      });

      expect(result.name).toBe('Updated Milk');
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'product-1' },
          data: { name: 'Updated Milk', defaultUnit: UnitType.L },
        }),
      );
    });
  });

  describe('suggestions', () => {
    it('should return empty array (placeholder)', async () => {
      const result = await service.suggestions();
      expect(result).toEqual({ data: [] });
    });
  });
});
