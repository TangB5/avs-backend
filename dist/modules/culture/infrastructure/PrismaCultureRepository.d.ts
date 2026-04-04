import type { PrismaClient } from '@prisma/client';
import type { ICultureRepository, FindPatternsOptions, FindResult } from '../domain/ICultureRepository';
import { CulturePattern } from '../domain/CulturePattern';
export declare class PrismaCultureRepository implements ICultureRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<CulturePattern | null>;
    findBySlug(slug: string): Promise<CulturePattern | null>;
    findMany(opts: FindPatternsOptions): Promise<FindResult<CulturePattern>>;
    save(pattern: CulturePattern): Promise<CulturePattern>;
    update(pattern: CulturePattern): Promise<CulturePattern>;
    delete(id: string): Promise<void>;
    exists(slug: string): Promise<boolean>;
    private toDomain;
    private toPersistence;
}
//# sourceMappingURL=PrismaCultureRepository.d.ts.map