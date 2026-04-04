"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.buildMeta = buildMeta;
function parsePagination(query) {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query.perPage ?? 20));
    const skip = (page - 1) * perPage;
    return { page, perPage, skip, take: perPage };
}
function buildMeta(totalItems, page, perPage) {
    return { page, perPage, totalItems, totalPages: Math.ceil(totalItems / perPage) };
}
//# sourceMappingURL=pagination.js.map