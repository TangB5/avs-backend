import type { CulturePattern, PatternType, Region } from './CulturePattern';
export interface FindPatternsOptions {
    page?: number;
    perPage?: number;
    region?: Region;
    patternType?: PatternType;
    search?: string;
    onlyPublished?: boolean;
    createdById?: string;
}
export interface FindResult<T> {
    items: T[];
    totalItems: number;
}
export interface ICultureRepository {
    findById(id: string): Promise<CulturePattern | null>;
    findBySlug(slug: string): Promise<CulturePattern | null>;
    findMany(options: FindPatternsOptions): Promise<FindResult<CulturePattern>>;
    save(pattern: CulturePattern): Promise<CulturePattern>;
    update(pattern: CulturePattern): Promise<CulturePattern>;
    delete(id: string): Promise<void>;
    exists(slug: string): Promise<boolean>;
}
//# sourceMappingURL=ICultureRepository.d.ts.map