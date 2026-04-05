import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductMatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find an existing product by name similarity within a household.
   * Uses case-insensitive contains match first, then Levenshtein distance
   * to rank candidates and return the best match.
   */
  async findMatch(
    householdId: string,
    name: string,
  ): Promise<Product | null> {
    const normalizedName = name.trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    // First: exact match (case-insensitive)
    const exactMatch = await this.prisma.product.findFirst({
      where: {
        householdId,
        name: { equals: normalizedName, mode: 'insensitive' },
      },
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Second: contains match — find candidates whose name contains the search
    // or whose name is contained in the search
    const candidates = await this.prisma.product.findMany({
      where: {
        householdId,
        OR: [
          { name: { contains: normalizedName, mode: 'insensitive' } },
          { name: { startsWith: normalizedName.substring(0, 3), mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    if (candidates.length === 0) {
      return null;
    }

    // Rank by Levenshtein distance
    const threshold = Math.max(3, Math.floor(normalizedName.length * 0.4));
    let bestMatch: Product | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      const distance = this.levenshteinDistance(
        normalizedName,
        candidate.name.toLowerCase(),
      );
      if (distance < bestDistance && distance <= threshold) {
        bestDistance = distance;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  /**
   * Compute the Levenshtein edit distance between two strings.
   */
  levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    // Use a two-row DP optimization
    const prev: number[] = Array.from({ length: n + 1 }, (_, i) => i);
    const curr: number[] = new Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          prev[j]! + 1, // deletion
          curr[j - 1]! + 1, // insertion
          prev[j - 1]! + cost, // substitution
        );
      }
      for (let j = 0; j <= n; j++) {
        prev[j] = curr[j]!;
      }
    }

    return prev[n]!;
  }
}
