"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCommentRepository = void 0;
class PrismaCommentRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.comment.findUnique({ where: { id } });
    }
    async findByTarget(target, params) {
        return this.db.comment.findMany({
            where: {
                ...(target.patternId && { patternId: target.patternId }),
                ...(target.artisanId && { artisanId: target.artisanId }),
            },
            skip: params?.skip,
            take: params?.take ?? 20,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
    }
    async countByTarget(target) {
        return this.db.comment.count({
            where: {
                ...(target.patternId && { patternId: target.patternId }),
                ...(target.artisanId && { artisanId: target.artisanId }),
            },
        });
    }
    async create(data) {
        return this.db.comment.create({
            data,
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
    }
    async update(id, data) {
        return this.db.comment.update({
            where: { id },
            data,
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });
    }
    async delete(id) {
        return this.db.comment.delete({ where: { id } });
    }
}
exports.PrismaCommentRepository = PrismaCommentRepository;
//# sourceMappingURL=PrismaCommentRepository.js.map