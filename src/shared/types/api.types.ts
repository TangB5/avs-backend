export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  meta?:   PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  code:    string;
  details?: unknown;
}

export interface PaginationMeta {
  page:       number;
  perPage:    number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?:    number;
  perPage?: number;
  search?:  string;
  sortBy?:  string;
  sortDir?: 'asc' | 'desc';
}

// Helper réponses
export const ok  = <T>(data: T, message = 'OK', meta?: PaginationMeta): ApiResponse<T> =>
  ({ success: true, message, data, ...(meta ? { meta } : {}) });

export const fail = (message: string, code = 'ERROR'): ApiError =>
  ({ success: false, message, code });
