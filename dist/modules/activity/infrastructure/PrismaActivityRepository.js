"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaActivityRepository = void 0;
class PrismaActivityRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByUser(userId, params) {
        return this.db.activity.findMany({
            where: { userId },
            skip: params?.skip,
            take: params?.take ?? 20,
            orderBy: { createdAt: 'desc' },
        });
    }
    async countByUser(userId) {
        return this.db.activity.count({ where: { userId } });
    }
    async create(data) {
        return this.db.activity.create({ data });
    }
    async getGlobalStats() {
        const [totalPatterns, totalUsers, totalArtisans, stats] = await Promise.all([
            this.db.pattern.count(),
            this.db.user.count(),
            this.db.artisan.count(),
            this.db.pattern.aggregate({
                _sum: { downloadCount: true },
            }),
        ]);
        return {
            totalPatterns,
            totalUsers,
            totalArtisans,
            totalDownloads: stats._sum?.downloadCount ?? 0,
        };
    }
}
exports.PrismaActivityRepository = PrismaActivityRepository;
//# sourceMappingURL=PrismaActivityRepository.js.map