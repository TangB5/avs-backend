export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: PaginationMeta;
}
export interface ApiError {
    success: false;
    message: string;
    code: string;
    details?: unknown;
}
export interface PaginationMeta {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
}
export interface PaginationQuery {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}
export declare const ok: <T>(data: T, message?: string, meta?: PaginationMeta) => ApiResponse<T>;
export declare const fail: (message: string, code?: string) => ApiError;
//# sourceMappingURL=api.types.d.ts.map