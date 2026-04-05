import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        sortOrder: true,
      },
    });
  }
}
