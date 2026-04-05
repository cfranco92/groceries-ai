import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthUser } from '../auth/auth.types';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    user: AuthUser,
    file: Express.Multer.File,
    dto: UploadReceiptDto,
  ) {
    this.ensureHousehold(user);

    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and PDF are allowed',
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const storageKey = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.householdId!,
    );

    const receipt = await this.prisma.receipt.create({
      data: {
        householdId: user.householdId!,
        userId: user.id,
        imageUrl: storageKey,
        status: 'PENDING',
        ...(dto.purchaseDate && {
          purchaseDate: new Date(dto.purchaseDate),
        }),
        ...(dto.merchantName && { merchantName: dto.merchantName }),
      },
      select: {
        id: true,
        status: true,
        imageUrl: true,
      },
    });

    const signedUrl = await this.storageService.getSignedUrl(receipt.imageUrl);

    return {
      id: receipt.id,
      status: receipt.status,
      imageUrl: signedUrl,
    };
  }

  async findAll(user: AuthUser, query: QueryReceiptsDto) {
    this.ensureHousehold(user);

    const {
      page = 1,
      limit = 20,
      sortOrder = 'desc',
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    // For endDate, set to end-of-day so receipts on that date are included
    const endOfDay = endDate
      ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1)
      : undefined;

    const where = {
      householdId: user.householdId!,
      ...(status && { status }),
      ...(startDate || endOfDay
        ? {
            purchaseDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endOfDay && { lte: endOfDay }),
            },
          }
        : {}),
    };

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        select: {
          id: true,
          merchantName: true,
          purchaseDate: true,
          total: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    // Sign image URLs
    const data = await Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        imageUrl: await this.storageService.getSignedUrl(receipt.imageUrl),
      })),
    );

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

  async findOne(user: AuthUser, receiptId: string) {
    this.ensureHousehold(user);

    const receipt = await this.prisma.receipt.findFirst({
      where: {
        id: receiptId,
        householdId: user.householdId!,
      },
      select: {
        id: true,
        merchantName: true,
        purchaseDate: true,
        subtotal: true,
        tax: true,
        total: true,
        status: true,
        imageUrl: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const signedUrl = await this.storageService.getSignedUrl(receipt.imageUrl);

    return {
      ...receipt,
      imageUrl: signedUrl,
    };
  }

  async remove(user: AuthUser, receiptId: string) {
    this.ensureAdmin(user);

    const receipt = await this.prisma.receipt.findFirst({
      where: {
        id: receiptId,
        householdId: user.householdId!,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    // Delete DB record first so admin cleanup is not blocked by storage errors
    await this.prisma.receipt.delete({ where: { id: receiptId } });

    // Best-effort storage cleanup
    try {
      await this.storageService.delete(receipt.imageUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to delete storage object for receipt ${receiptId}: ${error}`,
      );
    }
  }

  private ensureHousehold(user: AuthUser) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to access receipts',
      );
    }
  }

  private ensureAdmin(user: AuthUser) {
    if (!user.householdId) {
      throw new ForbiddenException(
        'You must belong to a household to access receipts',
      );
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only household admins can perform this action',
      );
    }
  }
}
