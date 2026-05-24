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
  // NOTE: Ces mappers utilisent l'ancien schéma et ne sont plus utilisés.
  // La nouvelle API utilise PatternListResponseMapper directement depuis Prisma.
  private toDomain(row: Prisma.PatternGetPayload<object>): CulturePattern {
    throw new Error('Repository.toDomain() est obsolète. Utiliser PatternListResponseMapper.');
  }

  private toPersistence(pattern: CulturePattern): Prisma.PatternCreateInput & { id: string } {
    throw new Error('Repository.toPersistence() est obsolète. À refactoriser.');
  }
}

