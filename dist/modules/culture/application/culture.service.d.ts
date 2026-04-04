import { CulturePattern, type CulturePatternProps } from '../domain/CulturePattern';
import type { ICultureRepository, FindPatternsOptions } from '../domain/ICultureRepository';
import type { PaginationMeta } from '@/shared/types/api.types';
export interface CreatePatternDto {
    nameFr: string;
    nameEn: string;
    descFr: string;
    descEn: string;
    patternType: CulturePatternProps['patternType'];
    region: CulturePatternProps['region'];
    country: string;
    colors: CulturePatternProps['colors'];
    symbolism: CulturePatternProps['symbolism'];
    createdById: string;
}
export interface UpdatePatternDto extends Partial<Omit<CreatePatternDto, 'createdById'>> {
}
export interface QueryPatternDto extends FindPatternsOptions {
    page?: number;
    perPage?: number;
}
export interface PatternListResult {
    items: CulturePattern[];
    meta: PaginationMeta;
}
export declare class CultureService {
    private readonly repository;
    constructor(repository: ICultureRepository);
    listPatterns(query: QueryPatternDto, requesterId?: string): Promise<PatternListResult>;
    getPatternBySlug(slug: string): Promise<CulturePattern>;
    createPattern(dto: CreatePatternDto): Promise<CulturePattern>;
    publishPattern(id: string, requesterId: string, requesterRole: string): Promise<CulturePattern>;
    deletePattern(id: string, requesterRole: string): Promise<void>;
    private generateSlug;
}
//# sourceMappingURL=culture.service.d.ts.map