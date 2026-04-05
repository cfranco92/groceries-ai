import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(CategoriesService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all categories sorted by sortOrder', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Fruits & Vegetables', icon: null, sortOrder: 0 },
        { id: 'cat-2', name: 'Dairy', icon: null, sortOrder: 1 },
      ];
      prisma.category.findMany.mockResolvedValue(mockCategories as never);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          icon: true,
          sortOrder: true,
        },
      });
    });

    it('should return empty array when no categories exist', async () => {
      prisma.category.findMany.mockResolvedValue([] as never);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });
});
