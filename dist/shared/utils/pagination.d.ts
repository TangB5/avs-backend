import type { PaginationQuery, PaginationMeta } from '../types/api.types';
export declare function parsePagination(query: PaginationQuery): {
    page: number;
    perPage: number;
    skip: number;
    take: number;
};
export declare function buildMeta(totalItems: number, page: number, perPage: number): PaginationMeta;
//# sourceMappingURL=pagination.d.ts.map