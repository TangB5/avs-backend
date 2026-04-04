"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
class PrismaUserRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.user.findUnique({ where: { id } });
    }
    async findByEmail(email) {
        return this.db.user.findUnique({ where: { email } });
    }
    async findAll(params) {
        return this.db.user.findMany({
            take: params?.take ?? 10,
            skip: params?.skip ?? 0,
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return this.db.user.create({ data });
    }
    async update(id, data) {
        return this.db.user.update({ where: { id }, data });
    }
    async delete(id) {
        return this.db.user.delete({ where: { id } });
    }
    async countPatterns(userId) {
        return this.db.pattern.count({ where: { createdById: userId } });
    }
    async countDownloads(userId) {
        return this.db.pattern.aggregate({
            where: { createdById: userId },
            _sum: { downloadCount: true },
        }).then(r => r._sum?.downloadCount ?? 0);
    }
    async countViews(userId) {
        return this.db.pattern.aggregate({
            where: { createdById: userId },
            _sum: { viewCount: true },
        }).then(r => r._sum?.viewCount ?? 0);
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=PrismaUserRepository.js.map