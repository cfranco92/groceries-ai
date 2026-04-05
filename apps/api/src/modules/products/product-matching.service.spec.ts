import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UnitType } from '@prisma/client';
import { ProductMatchingService } from './product-matching.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductMatchingService', () => {
  let service: ProductMatchingService;
  let prisma: DeepMockProxy<PrismaClient>;

  const makeProduct = (overrides: Record<string, unknown> = {}) => ({
    id: 'product-1',
    householdId: 'household-1',
    name: 'Whole Milk',
    categoryId: 'cat-1',
    defaultUnit: UnitType.UNIT,
    averagePrice: null,
    lastPurchasedAt: null,
    purchaseCount: 0,
    avgDaysBetween: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductMatchingService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(ProductMatchingService);
    prisma = module.get(PrismaService);
  });

  describe('findMatch', () => {
    it('should return null for empty name', async () => {
      const result = await service.findMatch('household-1', '  ');
      expect(result).toBeNull();
    });

    it('should return exact match (case-insensitive)', async () => {
      const product = makeProduct();
      prisma.product.findFirst.mockResolvedValue(product as never);

      const result = await service.findMatch('household-1', 'whole milk');

      expect(result).toEqual(product);
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          householdId: 'household-1',
          name: { equals: 'whole milk', mode: 'insensitive' },
        },
      });
    });

    it('should return fuzzy match when no exact match', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);

      const candidate = makeProduct({ name: 'Whole Milk' });
      prisma.product.findMany.mockResolvedValue([candidate] as never);

      const result = await service.findMatch('household-1', 'Whol Milk');

      expect(result).toEqual(candidate);
    });

    it('should return null when no candidates found', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);
      prisma.product.findMany.mockResolvedValue([] as never);

      const result = await service.findMatch('household-1', 'xyz product');

      expect(result).toBeNull();
    });

    it('should return null when candidates are too different', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);

      const candidate = makeProduct({ name: 'Completely Different Product Name' });
      prisma.product.findMany.mockResolvedValue([candidate] as never);

      const result = await service.findMatch('household-1', 'abc');

      expect(result).toBeNull();
    });

    it('should pick the closest match among multiple candidates', async () => {
      prisma.product.findFirst.mockResolvedValue(null as never);

      const closerMatch = makeProduct({ id: 'p-1', name: 'Whole Milk' });
      const fartherMatch = makeProduct({ id: 'p-2', name: 'Whole Milk 2L' });
      prisma.product.findMany.mockResolvedValue([
        fartherMatch,
        closerMatch,
      ] as never);

      const result = await service.findMatch('household-1', 'Whole Milk');

      expect(result?.id).toBe('p-1');
    });
  });

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(service.levenshteinDistance('abc', 'abc')).toBe(0);
    });

    it('should return the length of the other string when one is empty', () => {
      expect(service.levenshteinDistance('', 'abc')).toBe(3);
      expect(service.levenshteinDistance('abc', '')).toBe(3);
    });

    it('should compute single character edits', () => {
      expect(service.levenshteinDistance('cat', 'car')).toBe(1);
      expect(service.levenshteinDistance('cat', 'cats')).toBe(1);
      expect(service.levenshteinDistance('cat', 'at')).toBe(1);
    });

    it('should compute multiple edits', () => {
      expect(service.levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('should be case-sensitive', () => {
      expect(service.levenshteinDistance('Abc', 'abc')).toBe(1);
    });
  });
});
