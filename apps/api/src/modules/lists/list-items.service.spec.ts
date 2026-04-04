import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, UnitType } from '@prisma/client';
import { ListItemsService } from './list-items.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';

describe('ListItemsService', () => {
  let service: ListItemsService;
  let prisma: DeepMockProxy<PrismaClient>;

  const user: AuthUser = {
    id: 'user-1',
    firebaseUid: 'fb-1',
    email: 'user@test.com',
    displayName: 'User',
    role: UserRole.MEMBER,
    householdId: 'household-1',
  };

  const noHouseholdUser: AuthUser = {
    id: 'user-2',
    firebaseUid: 'fb-2',
    email: 'new@test.com',
    displayName: 'New',
    role: UserRole.MEMBER,
    householdId: null,
  };

  const mockList = {
    id: 'list-1',
    householdId: 'household-1',
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListItemsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(ListItemsService);
    prisma = module.get(PrismaService);
  });

  describe('addItem', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.addItem(noHouseholdUser, 'list-1', {
          name: 'Milk',
          quantity: 1,
          unit: UnitType.UNIT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for invalid list', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(null as never);

      await expect(
        service.addItem(user, 'nonexistent', {
          name: 'Milk',
          quantity: 1,
          unit: UnitType.UNIT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add item with auto-incremented sortOrder', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.listItem.aggregate.mockResolvedValue({
        _max: { sortOrder: 2 },
      } as never);
      const mockItem = {
        id: 'item-1',
        name: 'Milk',
        quantity: 1,
        sortOrder: 3,
      };
      prisma.listItem.create.mockResolvedValue(mockItem as never);

      const result = await service.addItem(user, 'list-1', {
        name: 'Milk',
        quantity: 1,
        unit: UnitType.UNIT,
      });
      expect(result.sortOrder).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('should update an item', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.listItem.findFirst.mockResolvedValue({
        id: 'item-1',
        listId: 'list-1',
      } as never);
      prisma.listItem.update.mockResolvedValue({
        id: 'item-1',
        isChecked: true,
      } as never);

      const result = await service.updateItem(user, 'list-1', 'item-1', {
        isChecked: true,
      });
      expect(result.isChecked).toBe(true);
    });

    it('should throw NotFoundException for invalid item', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.listItem.findFirst.mockResolvedValue(null as never);

      await expect(
        service.updateItem(user, 'list-1', 'nonexistent', { isChecked: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderItems', () => {
    it('should reorder items in a transaction', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.$transaction.mockResolvedValue([]);
      prisma.listItem.findMany.mockResolvedValue([
        { id: 'item-2', sortOrder: 0 },
        { id: 'item-1', sortOrder: 1 },
      ] as never);

      const result = await service.reorderItems(user, 'list-1', {
        items: [
          { id: 'item-2', sortOrder: 0 },
          { id: 'item-1', sortOrder: 1 },
        ],
      });
      expect(result).toHaveLength(2);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should delete an item', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.listItem.findFirst.mockResolvedValue({
        id: 'item-1',
        listId: 'list-1',
      } as never);
      prisma.listItem.delete.mockResolvedValue({} as never);

      await service.removeItem(user, 'list-1', 'item-1');
      expect(prisma.listItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });
});
