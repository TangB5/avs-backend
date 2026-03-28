// =============================================================================
// Infrastructure Adapter — PrismaCultureRepository
// Implémentation concrète de ICultureRepository avec Prisma.
// Équivalent Java : @Repository CultureRepositoryImpl (JPA/Hibernate)
//
// MIGRATION : Pour Java, remplacer par CultureRepositoryImpl implements
// CultureRepository avec @Autowired EntityManager. Le Service ne change pas.
// =============================================================================

import type { PrismaClient, Prisma } from '@prisma/client';
import type { ICultureRepository, FindPatternsOptions, FindResult } from '../domain/ICultureRepository';
import { CulturePattern, type PatternType, type Region, type UsageType } from '../domain/CulturePattern';

export class PrismaCultureRepository implements ICultureRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CulturePattern | null> {
    const row = await this.prisma.pattern.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<CulturePattern | null> {
    const row = await this.prisma.pattern.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }

  async findMany(opts: FindPatternsOptions): Promise<FindResult<CulturePattern>> {
    const { page = 1, perPage = 20, region, patternType, search, onlyPublished = true } = opts;
    const skip = (page - 1) * perPage;

    const where: Prisma.PatternWhereInput = {
      ...(onlyPublished && { isPublished: true }),
      ...(region && { region: region.toUpperCase().replace('-', '_') }),
      ...(patternType && { patternType: patternType.toUpperCase() }),
      ...(search && {
        OR: [
          { nameFr: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
          { symbolKeywords: { has: search.toLowerCase() } },
        ],
      }),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.pattern.findMany({ where, skip, take: perPage, orderBy: { createdAt: 'desc' } }),
      this.prisma.pattern.count({ where }),
    ]);

    return { items: rows.map(r => this.toDomain(r)), totalItems };
  }

  async save(pattern: CulturePattern): Promise<CulturePattern> {
    const data = this.toPersistence(pattern);
    const row  = await this.prisma.pattern.create({ data });
    return this.toDomain(row);
  }

  async update(pattern: CulturePattern): Promise<CulturePattern> {
    const { id, ...data } = this.toPersistence(pattern);
    const row = await this.prisma.pattern.update({ where: { id }, data });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pattern.delete({ where: { id } });
  }

  async exists(slug: string): Promise<boolean> {
    const count = await this.prisma.pattern.count({ where: { slug } });
    return count > 0;
  }

  // ── Mappers Domain ↔ Persistence ─────────────────────────────────────────
  private toDomain(row: Prisma.PatternGetPayload<object>): CulturePattern {
    return CulturePattern.create({
      id:          row.id,
      slug:        row.slug,
      nameFr:      row.nameFr,
      nameEn:      row.nameEn,
      descFr:      row.descFr,
      descEn:      row.descEn,
      patternType: row.patternType.toLowerCase() as PatternType,
      region:      row.region.toLowerCase().replace('_', '-') as Region,
      country:     row.country,
      colors:      { primary: row.colorPrimary, secondary: row.colorSecondary, accent: row.colorAccent ?? undefined },
      symbolism:   { meaning: row.symbolMeaning, keywords: row.symbolKeywords, usage: row.symbolUsage.toLowerCase() as UsageType },
      isPublished: row.isPublished,
      isFeatured:  row.isFeatured,
      viewCount:   row.viewCount,
      createdAt:   row.createdAt,
      updatedAt:   row.updatedAt,
      createdById: row.createdById,
    });
  }

  private toPersistence(pattern: CulturePattern): Prisma.PatternCreateInput & { id: string } {
    const p = pattern.toObject();
    return {
      id:             p.id,
      slug:           p.slug,
      nameFr:         p.nameFr,
      nameEn:         p.nameEn,
      descFr:         p.descFr,
      descEn:         p.descEn,
      patternType:    p.patternType.toUpperCase() as Prisma.EnumPatternTypeFilter,
      region:         p.region.toUpperCase().replace('-', '_') as Prisma.EnumRegionFilter,
      country:        p.country,
      colorPrimary:   p.colors.primary,
      colorSecondary: p.colors.secondary,
      colorAccent:    p.colors.accent,
      symbolMeaning:  p.symbolism.meaning,
      symbolKeywords: p.symbolism.keywords,
      symbolUsage:    p.symbolism.usage.toUpperCase() as Prisma.EnumUsageTypeFilter,
      isPublished:    p.isPublished,
      isFeatured:     p.isFeatured,
      viewCount:      p.viewCount,
      createdAt:      p.createdAt,
      updatedAt:      p.updatedAt,
      createdBy:      { connect: { id: p.createdById } },
    };
  }
}
