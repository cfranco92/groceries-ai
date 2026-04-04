import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: null,
        role: 'MEMBER' as const,
        createdAt: new Date(),
        household: null,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser as never);

      const result = await service.getProfile('user-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null as never);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update and return the user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Updated Name',
        avatarUrl: null,
        role: 'MEMBER' as const,
        createdAt: new Date(),
        household: null,
      };

      prisma.user.update.mockResolvedValue(mockUser as never);

      const result = await service.updateProfile('user-1', {
        displayName: 'Updated Name',
      });
      expect(result.displayName).toBe('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { displayName: 'Updated Name' },
        select: expect.any(Object),
      });
    });
  });
});
