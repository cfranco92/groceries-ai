import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthUser, query: QueryProductsDto) {
    this.ensureHousehold(user);

    const {
      page = 1,
      limit = 20,
      sortOrder = 'asc',
      search,
      categoryId,
      sortBy = 'name',
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      householdId: user.householdId!,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(categoryId && { categoryId }),
    };

    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          defaultUnit: true,
          averagePrice: true,
          lastPurchasedAt: true,
          purchaseCount: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, icon: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
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

  async findOne(user: AuthUser, productId: string) {
    this.ensureHousehold(user);

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        householdId: user.householdId!,
      },
      select: {
        id: true,
        name: true,
        defaultUnit: true,
        averagePrice: true,
        lastPurchasedAt: true,
        purchaseCount: true,
        avgDaysBetween: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, icon: true },
        },
        receiptItems: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            createdAt: true,
            receipt: {
              select: {
                id: true,
                purchaseDate: true,
                merchantName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(user: AuthUser, productId: string, dto: UpdateProductDto) {
    this.ensureAdmin(user);

    // Verify product belongs to user's household
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        householdId: user.householdId!,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If categoryId is provided, verify it exists
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
      select: {
        id: true,
        name: true,
        defaultUnit: true,
        averagePrice: true,
        lastPurchasedAt: true,
        purchaseCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
  }

  async suggestions() {
    // Placeholder — full implementation in SCRUM-29
    return { data: [] };
  }

  private ensureHousehold(user: AuthUser) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to access products',
      );
    }
  }

  private ensureAdmin(user: AuthUser) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to access products',
      );
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only household admins can perform this action',
      );
    }
  }
}
