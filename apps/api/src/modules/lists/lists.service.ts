import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListQueryDto } from './dto/list-query.dto';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthUser, query: ListQueryDto) {
    this.ensureHousehold(user);

    const { page = 1, limit = 20, sortOrder = 'desc', status } = query;
    const skip = (page - 1) * limit;

    const where = {
      householdId: user.householdId!,
      deletedAt: null,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.shoppingList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          completedAt: true,
          createdBy: {
            select: { id: true, displayName: true },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.shoppingList.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        hasNextPage: skip + limit < total,
      },
    };
  }

  async findOne(user: AuthUser, listId: string) {
    this.ensureHousehold(user);

    const list = await this.prisma.shoppingList.findFirst({
      where: {
        id: listId,
        householdId: user.householdId!,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                averagePrice: true,
                category: {
                  select: { id: true, name: true, icon: true },
                },
              },
            },
            addedBy: {
              select: { id: true, displayName: true },
            },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }

    return list;
  }

  async create(user: AuthUser, dto: CreateListDto) {
    this.ensureHousehold(user);

    return this.prisma.shoppingList.create({
      data: {
        name: dto.name,
        householdId: user.householdId!,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { id: true, displayName: true },
        },
      },
    });
  }

  async update(user: AuthUser, listId: string, dto: UpdateListDto) {
    const list = await this.findOne(user, listId);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === ListStatus.COMPLETED) {
        data.completedAt = new Date();
      } else if (list.status === ListStatus.COMPLETED) {
        data.completedAt = null;
      }
    }

    return this.prisma.shoppingList.update({
      where: { id: listId },
      data,
      include: {
        createdBy: {
          select: { id: true, displayName: true },
        },
      },
    });
  }

  async remove(user: AuthUser, listId: string) {
    const list = await this.findOne(user, listId);

    if (list.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the list creator or an admin can delete this list',
      );
    }

    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { deletedAt: new Date() },
    });
  }

  private ensureHousehold(user: AuthUser) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to manage lists',
      );
    }
  }
}
