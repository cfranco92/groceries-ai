import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, ListStatus } from '@prisma/client';
import { ListsService } from './lists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';

describe('ListsService', () => {
  let service: ListsService;
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
        ListsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(ListsService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should throw ForbiddenException for user without household', async () => {
      await expect(
        service.findAll(noHouseholdUser, {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return paginated lists', async () => {
      const mockLists = [
        { id: 'list-1', name: 'Groceries', status: ListStatus.ACTIVE },
      ];
      prisma.shoppingList.findMany.mockResolvedValue(mockLists as never);
      prisma.shoppingList.count.mockResolvedValue(1 as never);

      const result = await service.findAll(adminUser, {
        page: 1,
        limit: 20,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should filter by status', async () => {
      prisma.shoppingList.findMany.mockResolvedValue([] as never);
      prisma.shoppingList.count.mockResolvedValue(0 as never);

      await service.findAll(adminUser, { status: ListStatus.COMPLETED });

      expect(prisma.shoppingList.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ListStatus.COMPLETED,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if list not found', async () => {
      prisma.shoppingList.findFirst.mockResolvedValue(null as never);

      await expect(
        service.findOne(adminUser, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return list with items', async () => {
      const mockList = {
        id: 'list-1',
        name: 'Groceries',
        householdId: 'household-1',
        createdById: 'user-1',
        status: ListStatus.ACTIVE,
        items: [],
      };
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);

      const result = await service.findOne(adminUser, 'list-1');
      expect(result.id).toBe('list-1');
    });
  });

  describe('create', () => {
    it('should create a list for user with household', async () => {
      const mockList = {
        id: 'list-1',
        name: 'New List',
        householdId: 'household-1',
        createdById: 'user-1',
      };
      prisma.shoppingList.create.mockResolvedValue(mockList as never);

      const result = await service.create(adminUser, { name: 'New List' });
      expect(result.name).toBe('New List');
    });
  });

  describe('update', () => {
    it('should set completedAt when status changes to COMPLETED', async () => {
      const mockList = {
        id: 'list-1',
        name: 'Groceries',
        householdId: 'household-1',
        createdById: 'user-1',
        status: ListStatus.ACTIVE,
        items: [],
      };
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.shoppingList.update.mockResolvedValue({
        ...mockList,
        status: ListStatus.COMPLETED,
      } as never);

      await service.update(adminUser, 'list-1', {
        status: ListStatus.COMPLETED,
      });

      expect(prisma.shoppingList.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ListStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException for non-creator non-admin', async () => {
      const mockList = {
        id: 'list-1',
        name: 'Groceries',
        householdId: 'household-1',
        createdById: 'user-1',
        status: ListStatus.ACTIVE,
        items: [],
      };
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);

      await expect(
        service.remove(memberUser, 'list-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete for the creator', async () => {
      const mockList = {
        id: 'list-1',
        name: 'Groceries',
        householdId: 'household-1',
        createdById: 'user-2',
        status: ListStatus.ACTIVE,
        items: [],
      };
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.shoppingList.update.mockResolvedValue({} as never);

      await service.remove(memberUser, 'list-1');
      expect(prisma.shoppingList.update).toHaveBeenCalledWith({
        where: { id: 'list-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should soft delete for admin', async () => {
      const mockList = {
        id: 'list-1',
        name: 'Groceries',
        householdId: 'household-1',
        createdById: 'user-2',
        status: ListStatus.ACTIVE,
        items: [],
      };
      prisma.shoppingList.findFirst.mockResolvedValue(mockList as never);
      prisma.shoppingList.update.mockResolvedValue({} as never);

      await service.remove(adminUser, 'list-1');
      expect(prisma.shoppingList.update).toHaveBeenCalled();
    });
  });
});
