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
import { CulturePattern, type PatternType } from '../domain/CulturePattern';

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
          { name: { contains: search, mode: 'insensitive' } },
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
    return CulturePattern.create({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameLocal: row.nameLocal,
      imgUrl: row.imgUrl,
      type: row.type as PatternType,
      cssClass: row.cssClass,
      era: row.era,
      license: row.license,
      summary: row.summary,
      history: row.history,
      technique: row.technique,
      symbolism: row.symbolism,
      ceremonial: row.ceremonial,
      sources: row.sources || [],
      downloads: row.downloads || 0,
      views: row.views || 0,
      status: row.status,
      isFeatured: row.isFeatured || false,
      origin: row.origin || undefined,
      colors: row.colors || undefined,
      symbols: row.symbols || undefined,
      artisanQuote: row.artisanQuote || undefined,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toPersistence(pattern: CulturePattern): Prisma.PatternCreateInput & { id: string } {
    const props = pattern.toObject();
    
    return {
      id: props.id,
      slug: props.slug,
      name: props.name || '',
      nameLocal: props.nameLocal || 'Unknown',
      imgUrl: props.imgUrl || '',
      type: props.type,
      cssClass: props.cssClass,
      era: props.era,
      license: props.license,
      summary: props.summary,
      history: props.history,
      technique: props.technique,
      symbolism: props.symbolism,
      ceremonial: props.ceremonial,
      sources: props.sources,
      downloads: props.downloads,
      views: props.views,
      status: props.status,
      isFeatured: props.isFeatured,
      createdById: props.createdById,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

