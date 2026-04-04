"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPaletteRepository = void 0;
class PrismaPaletteRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id, params) {
        return this.db.palette.findUnique({
            where: { id },
            include: params?.include,
        });
    }
    async findAll(params) {
        return this.db.palette.findMany({
            skip: params.skip,
            take: params.take ?? 20,
            where: params.isPublished ? { isPublished: true } : {},
            include: params.include,
            orderBy: { createdAt: 'desc' },
        });
    }
    async count() {
        return this.db.palette.count({ where: { isPublished: true } });
    }
    async create(data) {
        return this.db.palette.create({ data, include: { tokens: true } });
    }
    async update(id, data) {
        return this.db.palette.update({
            where: { id },
            data,
            include: { tokens: true },
        });
    }
    async delete(id) {
        return this.db.palette.delete({ where: { id } });
    }
}
exports.PrismaPaletteRepository = PrismaPaletteRepository;
//# sourceMappingURL=PrismaPaletteRepository.js.map