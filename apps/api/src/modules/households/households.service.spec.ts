import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, UserRole, InviteStatus } from '@prisma/client';
import { HouseholdsService } from './households.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';

describe('HouseholdsService', () => {
  let service: HouseholdsService;
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
        HouseholdsService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(HouseholdsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should throw ConflictException if user already has a household', async () => {
      await expect(
        service.create(adminUser, { name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a household for a user without one', async () => {
      const mockHousehold = {
        id: 'new-household',
        name: 'Test House',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: noHouseholdUser.id,
            displayName: 'New User',
            email: 'new@test.com',
            role: UserRole.ADMIN,
            avatarUrl: null,
          },
        ],
      };

      prisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          return fn(prisma);
        }
        return [];
      });
      prisma.household.create.mockResolvedValue(mockHousehold as never);
      prisma.user.update.mockResolvedValue({} as never);
      prisma.household.findUnique.mockResolvedValue(mockHousehold as never);

      const result = await service.create(noHouseholdUser, {
        name: 'Test House',
      });
      expect(result?.name).toBe('Test House');
    });
  });

  describe('getMyHousehold', () => {
    it('should throw NotFoundException if user has no household', async () => {
      await expect(
        service.getMyHousehold(noHouseholdUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return household with members', async () => {
      const mockHousehold = {
        id: 'household-1',
        name: 'Test House',
        members: [],
      };
      prisma.household.findUnique.mockResolvedValue(mockHousehold as never);

      const result = await service.getMyHousehold(adminUser);
      expect(result?.name).toBe('Test House');
    });
  });

  describe('updateMyHousehold', () => {
    it('should throw ForbiddenException for non-admin', async () => {
      await expect(
        service.updateMyHousehold(memberUser, { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update household name for admin', async () => {
      prisma.household.update.mockResolvedValue({
        id: 'household-1',
        name: 'Updated',
      } as never);

      const result = await service.updateMyHousehold(adminUser, {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('createInvite', () => {
    it('should throw ForbiddenException for non-admin', async () => {
      await expect(service.createInvite(memberUser, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create an invite for admin', async () => {
      const mockInvite = {
        id: 'invite-1',
        inviteCode: 'ABCD1234',
        expiresAt: new Date(),
      };
      prisma.householdInvite.create.mockResolvedValue(mockInvite as never);

      const result = await service.createInvite(adminUser, {});
      expect(result.inviteCode).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('joinHousehold', () => {
    it('should throw ConflictException if user already has a household', async () => {
      await expect(
        service.joinHousehold(adminUser, { inviteCode: 'ABCD1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for invalid invite code', async () => {
      prisma.householdInvite.findUnique.mockResolvedValue(null as never);

      await expect(
        service.joinHousehold(noHouseholdUser, { inviteCode: 'INVALID1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for expired invite', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      prisma.householdInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        inviteCode: 'ABCD1234',
        status: InviteStatus.PENDING,
        expiresAt: expiredDate,
        householdId: 'household-1',
        household: { id: 'household-1', name: 'Test' },
      } as never);
      prisma.householdInvite.update.mockResolvedValue({} as never);

      await expect(
        service.joinHousehold(noHouseholdUser, { inviteCode: 'ABCD1234' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should throw ForbiddenException for non-admin', async () => {
      await expect(
        service.removeMember(memberUser, 'user-3'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when admin tries to remove themselves', async () => {
      await expect(
        service.removeMember(adminUser, adminUser.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should remove a member', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-2',
        householdId: 'household-1',
      } as never);
      prisma.user.update.mockResolvedValue({} as never);

      await service.removeMember(adminUser, 'user-2');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-2' },
        data: { householdId: null, role: UserRole.MEMBER },
      });
    });
  });
});
