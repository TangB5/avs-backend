"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaArtisanRepository = void 0;
class PrismaArtisanRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.artisan.findUnique({ where: { id } });
    }
    async findAll(params) {
        return this.db.artisan.findMany({
            take: params?.take ?? 10,
            skip: params?.skip ?? 0,
            orderBy: { rating: 'desc' },
        });
    }
    async findFiltered(params) {
        return this.db.artisan.findMany({
            skip: params.skip,
            take: params.take ?? 20,
            where: {
                ...(params.search && {
                    OR: [
                        { name: { contains: params.search, mode: 'insensitive' } },
                        { origin: { contains: params.search, mode: 'insensitive' } },
                        { bio: { contains: params.search, mode: 'insensitive' } },
                    ],
                }),
                ...(params.specialty && {
                    specialties: { has: params.specialty },
                }),
            },
            orderBy: { rating: 'desc' },
        });
    }
    async countFiltered(params) {
        return this.db.artisan.count({
            where: {
                ...(params.search && {
                    OR: [
                        { name: { contains: params.search, mode: 'insensitive' } },
                        { origin: { contains: params.search, mode: 'insensitive' } },
                        { bio: { contains: params.search, mode: 'insensitive' } },
                    ],
                }),
                ...(params.specialty && {
                    specialties: { has: params.specialty },
                }),
            },
        });
    }
    async create(data) {
        return this.db.artisan.create({ data });
    }
    async update(id, data) {
        return this.db.artisan.update({ where: { id }, data });
    }
    async delete(id) {
        return this.db.artisan.delete({ where: { id } });
    }
}
exports.PrismaArtisanRepository = PrismaArtisanRepository;
//# sourceMappingURL=PrismaArtisanRepository.js.map