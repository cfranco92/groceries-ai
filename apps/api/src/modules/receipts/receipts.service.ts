import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProductMatchingService } from '../products/product-matching.service';
import { OcrService, ParsedReceiptData } from './ocr.service';
import { AuthUser } from '../auth/auth.types';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly ocrService: OcrService,
    private readonly productMatchingService: ProductMatchingService,
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
    });

    // Process receipt synchronously (Sprint 2 strategy)
    const processed = await this.processReceipt(
      receipt.id,
      user.householdId!,
      file.buffer,
      file.mimetype,
      dto.purchaseDate ? new Date(dto.purchaseDate) : null,
      dto.merchantName || null,
    );

    const signedUrl = await this.storageService.getSignedUrl(receipt.imageUrl);

    return {
      id: processed.id,
      status: processed.status,
      merchantName: processed.merchantName,
      purchaseDate: processed.purchaseDate,
      total: processed.total,
      imageUrl: signedUrl,
    };
  }

  async processReceipt(
    receiptId: string,
    householdId: string,
    imageBuffer: Buffer,
    mimeType: string,
    userPurchaseDate: Date | null,
    userMerchantName: string | null,
  ) {
    // Set status to PROCESSING
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'PROCESSING' },
    });

    try {
      const parsed = await this.ocrService.processReceipt(
        imageBuffer,
        mimeType,
      );

      // Create receipt items and match/create products
      const productIds = await this.createReceiptItems(
        receiptId,
        householdId,
        parsed,
      );

      // Use user-provided values if present, fallback to OCR values
      const merchantName = userMerchantName || parsed.merchantName;
      const purchaseDate = userPurchaseDate || parsed.purchaseDate;

      // Update receipt with OCR results
      const updated = await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'COMPLETED',
          merchantName,
          purchaseDate,
          subtotal: parsed.subtotal,
          tax: parsed.tax,
          total: parsed.total,
          rawOcrData: parsed.rawResponse as Prisma.InputJsonValue,
          processedAt: new Date(),
        },
      });

      // Update product stats for all matched products
      await this.updateProductStats(productIds);

      return updated;
    } catch (error) {
      this.logger.error(
        `OCR processing failed for receipt ${receiptId}: ${error}`,
      );
      return this.prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'FAILED' },
      });
    }
  }

  private async createReceiptItems(
    receiptId: string,
    householdId: string,
    parsed: ParsedReceiptData,
  ): Promise<string[]> {
    const productIds: string[] = [];

    for (const item of parsed.items) {
      if (!item.name) continue;

      // Try to match existing product
      let product = await this.productMatchingService.findMatch(
        householdId,
        item.name,
      );

      // Create new product if no match found
      if (!product) {
        // Find the "Other" category
        const otherCategory = await this.prisma.category.findFirst({
          where: { name: { equals: 'Other', mode: 'insensitive' } },
        });

        product = await this.prisma.product.create({
          data: {
            householdId,
            name: item.name,
            categoryId: otherCategory?.id ?? null,
            defaultUnit: 'UNIT',
          },
        });
      }

      await this.prisma.receiptItem.create({
        data: {
          receiptId,
          productId: product.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });

      if (!productIds.includes(product.id)) {
        productIds.push(product.id);
      }
    }

    return productIds;
  }

  async updateProductStats(productIds: string[]): Promise<void> {
    for (const productId of productIds) {
      try {
        // Get all receipt items for this product with their receipt dates
        const receiptItems = await this.prisma.receiptItem.findMany({
          where: { productId },
          include: {
            receipt: { select: { purchaseDate: true } },
          },
          orderBy: { createdAt: 'asc' },
        });

        if (receiptItems.length === 0) continue;

        // Calculate purchaseCount
        const purchaseCount = receiptItems.length;

        // Calculate averagePrice from unit prices
        const prices = receiptItems.map((ri) => Number(ri.unitPrice));
        const averagePrice =
          prices.reduce((sum, p) => sum + p, 0) / prices.length;

        // Calculate lastPurchasedAt
        const purchaseDates = receiptItems
          .map((ri) => ri.receipt.purchaseDate)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => a.getTime() - b.getTime());

        const lastPurchasedAt =
          purchaseDates.length > 0
            ? purchaseDates[purchaseDates.length - 1]!
            : null;

        // Calculate avgDaysBetween from unique purchase dates
        const uniqueDateTimestamps = [
          ...new Set(purchaseDates.map((d) => d.toISOString().split('T')[0])),
        ]
          .map((ds) => new Date(ds!).getTime())
          .sort((a, b) => a - b);

        let avgDaysBetween: number | null = null;
        if (uniqueDateTimestamps.length >= 2) {
          const dayDiffs: number[] = [];
          for (let i = 1; i < uniqueDateTimestamps.length; i++) {
            const diff =
              (uniqueDateTimestamps[i]! - uniqueDateTimestamps[i - 1]!) /
              (1000 * 60 * 60 * 24);
            dayDiffs.push(diff);
          }
          avgDaysBetween =
            dayDiffs.reduce((sum, d) => sum + d, 0) / dayDiffs.length;
        }

        await this.prisma.product.update({
          where: { id: productId },
          data: {
            purchaseCount,
            averagePrice: new Decimal(averagePrice.toFixed(2)),
            lastPurchasedAt,
            avgDaysBetween,
          },
        });
      } catch (error) {
        this.logger.warn(
          `Failed to update stats for product ${productId}: ${error}`,
        );
      }
    }
  }

  async updateItem(
    user: AuthUser,
    receiptId: string,
    itemId: string,
    dto: UpdateReceiptItemDto,
  ) {
    this.ensureHousehold(user);

    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, householdId: user.householdId! },
    });
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const item = await this.prisma.receiptItem.findFirst({
      where: { id: itemId, receiptId },
    });
    if (!item) {
      throw new NotFoundException('Receipt item not found');
    }

    // If changing productId, validate the new product belongs to the household
    if (dto.productId !== undefined) {
      const product = await this.prisma.product.findFirst({
        where: { id: dto.productId, householdId: user.householdId! },
      });
      if (!product) {
        throw new BadRequestException(
          'Product not found in your household',
        );
      }
    }

    const oldProductId = item.productId;

    const updated = await this.prisma.receiptItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
        ...(dto.totalPrice !== undefined && { totalPrice: dto.totalPrice }),
        ...(dto.productId !== undefined && { productId: dto.productId }),
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    // Recalculate product stats if productId changed
    if (dto.productId !== undefined && dto.productId !== oldProductId) {
      const productIdsToUpdate = [dto.productId];
      if (oldProductId) productIdsToUpdate.push(oldProductId);
      await this.updateProductStats(productIdsToUpdate);
    }

    return updated;
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
