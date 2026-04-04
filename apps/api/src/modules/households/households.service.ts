import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, InviteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JoinHouseholdDto } from './dto/join-household.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateHouseholdDto) {
    if (user.householdId) {
      throw new ConflictException('User already belongs to a household');
    }

    const household = await this.prisma.$transaction(async (tx) => {
      const created = await tx.household.create({
        data: { name: dto.name },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { householdId: created.id, role: UserRole.ADMIN },
      });

      return created;
    });

    return this.prisma.household.findUnique({
      where: { id: household.id },
      include: {
        members: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getMyHousehold(user: AuthUser) {
    if (!user.householdId) {
      throw new NotFoundException('User does not belong to a household');
    }

    return this.prisma.household.findUnique({
      where: { id: user.householdId },
      include: {
        members: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateMyHousehold(user: AuthUser, dto: UpdateHouseholdDto) {
    this.ensureAdmin(user);

    return this.prisma.household.update({
      where: { id: user.householdId! },
      data: { name: dto.name },
      include: {
        members: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createInvite(user: AuthUser, dto: CreateInviteDto) {
    this.ensureAdmin(user);

    const inviteCode = this.generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.householdInvite.create({
      data: {
        householdId: user.householdId!,
        email: dto.email || null,
        inviteCode,
        expiresAt,
      },
    });

    return {
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
    };
  }

  async joinHousehold(user: AuthUser, dto: JoinHouseholdDto) {
    if (user.householdId) {
      throw new ConflictException('User already belongs to a household');
    }

    const invite = await this.prisma.householdInvite.findUnique({
      where: { inviteCode: dto.inviteCode },
      include: { household: true },
    });

    if (!invite) {
      throw new NotFoundException('Invite code not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer valid');
    }

    if (new Date() > invite.expiresAt) {
      await this.prisma.householdInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      throw new BadRequestException('Invite code has expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { householdId: invite.householdId, role: UserRole.MEMBER },
      }),
      this.prisma.householdInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.ACCEPTED },
      }),
    ]);

    return this.prisma.household.findUnique({
      where: { id: invite.householdId },
      include: {
        members: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async listInvites(user: AuthUser) {
    this.ensureAdmin(user);

    return this.prisma.householdInvite.findMany({
      where: { householdId: user.householdId! },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inviteCode: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async cancelInvite(user: AuthUser, inviteId: string) {
    this.ensureAdmin(user);

    const invite = await this.prisma.householdInvite.findFirst({
      where: { id: inviteId, householdId: user.householdId! },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.prisma.householdInvite.update({
      where: { id: inviteId },
      data: { status: InviteStatus.CANCELLED },
    });
  }

  async removeMember(user: AuthUser, memberUserId: string) {
    this.ensureAdmin(user);

    if (user.id === memberUserId) {
      throw new BadRequestException('Cannot remove yourself from the household');
    }

    const member = await this.prisma.user.findFirst({
      where: { id: memberUserId, householdId: user.householdId! },
    });

    if (!member) {
      throw new NotFoundException('Member not found in your household');
    }

    await this.prisma.user.update({
      where: { id: memberUserId },
      data: { householdId: null, role: UserRole.MEMBER },
    });
  }

  private ensureAdmin(user: AuthUser) {
    if (!user.householdId) {
      throw new NotFoundException('User does not belong to a household');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only household admins can perform this action');
    }
  }

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
  }
}
