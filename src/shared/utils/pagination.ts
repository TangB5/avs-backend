import type { PaginationQuery, PaginationMeta } from '../types/api.types';

export function parsePagination(query: PaginationQuery) {
  const page    = Math.max(1, query.page    ?? 1);
  const perPage = Math.min(100, Math.max(1, query.perPage ?? 20));
  const skip    = (page - 1) * perPage;
  return { page, perPage, skip, take: perPage };
}

export function buildMeta(totalItems: number, page: number, perPage: number): PaginationMeta {
  return { page, perPage, totalItems, totalPages: Math.ceil(totalItems / perPage) };
}
