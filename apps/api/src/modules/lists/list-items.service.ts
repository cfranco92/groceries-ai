import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';

@Injectable()
export class ListItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async addItem(user: AuthUser, listId: string, dto: CreateListItemDto) {
    await this.ensureListAccess(user, listId);

    const maxSortOrder = await this.prisma.listItem.aggregate({
      where: { listId },
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    return this.prisma.listItem.create({
      data: {
        listId,
        name: dto.name,
        quantity: dto.quantity ?? 1,
        unit: dto.unit,
        productId: dto.productId,
        notes: dto.notes,
        addedById: user.id,
        sortOrder: nextSortOrder,
      },
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
    });
  }

  async updateItem(
    user: AuthUser,
    listId: string,
    itemId: string,
    dto: UpdateListItemDto,
  ) {
    await this.ensureListAccess(user, listId);
    await this.ensureItemExists(listId, itemId);

    return this.prisma.listItem.update({
      where: { id: itemId },
      data: dto,
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
    });
  }

  async reorderItems(user: AuthUser, listId: string, dto: ReorderItemsDto) {
    await this.ensureListAccess(user, listId);

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.listItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.prisma.listItem.findMany({
      where: { listId },
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
    });
  }

  async removeItem(user: AuthUser, listId: string, itemId: string) {
    await this.ensureListAccess(user, listId);
    await this.ensureItemExists(listId, itemId);

    await this.prisma.listItem.delete({
      where: { id: itemId },
    });
  }

  private async ensureListAccess(user: AuthUser, listId: string) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to manage list items',
      );
    }

    const list = await this.prisma.shoppingList.findFirst({
      where: {
        id: listId,
        householdId: user.householdId,
        deletedAt: null,
      },
    });

    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }
  }

  private async ensureItemExists(listId: string, itemId: string) {
    const item = await this.prisma.listItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!item) {
      throw new NotFoundException('List item not found');
    }
  }
}
