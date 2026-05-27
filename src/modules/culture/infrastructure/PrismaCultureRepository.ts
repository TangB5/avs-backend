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
    const row = await this.prisma.pattern.findUnique({
      where: { id },
      include: { origin: true, colors: true, symbols: true, artisanQuote: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<CulturePattern | null> {
    const row = await this.prisma.pattern.findUnique({
      where: { slug },
      include: { origin: true, colors: true, symbols: true, artisanQuote: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findBySlugRaw(slug: string) {
    return await this.prisma.pattern.findUnique({
      where: { slug },
      include: { origin: true, colors: true, symbols: true, artisanQuote: true },
    });
  }

  async findMany(opts: FindPatternsOptions): Promise<FindResult<CulturePattern>> {
    const { page = 1, perPage = 20, search } = opts;
    const skip = (page - 1) * perPage;

    const where: Prisma.PatternWhereInput = {
      ...(search && {
        OR: [
          { nameFr: { contains: search, mode: 'insensitive' } },
          { nameLocal: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.pattern.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { origin: true, colors: true, symbols: true, artisanQuote: true },
      }),
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
  private toDomain(row: any): CulturePattern {
    // Backward compatibility: This is only called by save/update
    // Convert Prisma row to CulturePattern domain object
    return CulturePattern.create({
      id: row.id,
      slug: row.slug,
      nameFr: row.nameFr,
      nameEn: row.nameEn || row.nameFr,
      descFr: row.descFr || row.history || '',
      descEn: row.descEn || row.history || '',
      patternType: row.type.toLowerCase() as PatternType,
      region: 'west-africa',
      country: row.nameLocal?.substring(0, 2).toUpperCase() || 'XX', // Fallback to XX if not available
      colors: {
        primary: '#C0573E',
        secondary: '#F5EBE0',
      },
      symbolism: {
        meaning: row.symbolism || '',
        keywords: [],
        usage: 'universal',
      },
      isPublished: false,
      isFeatured: false,
      viewCount: row.views || 0,
      svgUrl: undefined,
      metadata: {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdById: row.createdById || '',
    });
  }

  private toPersistence(pattern: CulturePattern): Prisma.PatternCreateInput & { id: string } {
    const props = pattern.toObject();
    const patternTypeUpper = props.patternType.toUpperCase() as 'KENTE' | 'BOGOLAN' | 'ADINKRA' | 'NDEBELE' | 'KUBA' | 'NDOP' | 'WAX' | 'BERBER';
    
    return {
      id: props.id,
      slug: props.slug,
      nameFr: props.nameFr,
      nameLocal: props.metadata?.nameLocal || 'Unknown',
      type: patternTypeUpper,
      cssClass: `avs-pattern-${props.patternType.toLowerCase()}-default`,
      era: props.metadata?.era,
      license: props.metadata?.license || 'cc-by',
      summary: props.metadata?.summary || 'Summary not provided',
      history: props.metadata?.history || 'History not provided',
      technique: props.metadata?.technique || 'Technique not provided',
      symbolism: props.symbolism?.meaning || 'Symbolism not provided',
      ceremonial: props.metadata?.ceremonial || 'Not specified',
      sources: props.metadata?.sources || [],
      downloads: 0,
      views: props.viewCount || 0,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

