"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTemplateRepository = void 0;
class PrismaTemplateRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.template.findUnique({ where: { id } });
    }
    async findFiltered(params) {
        return this.db.template.findMany({
            skip: params.skip,
            take: params.take ?? 20,
            where: {
                ...(params.category && { category: params.category }),
                ...(params.framework && { framework: params.framework }),
                ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async countFiltered(params) {
        return this.db.template.count({
            where: {
                ...(params.category && { category: params.category }),
                ...(params.framework && { framework: params.framework }),
                ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
            },
        });
    }
    async findFeatured(limit) {
        return this.db.template.findMany({
            where: { isFeatured: true, isPublished: true },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.PrismaTemplateRepository = PrismaTemplateRepository;
//# sourceMappingURL=PrismaTemplateRepository.js.map