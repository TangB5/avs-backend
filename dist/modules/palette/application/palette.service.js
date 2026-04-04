"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteService = void 0;
class PaletteService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async listPalettes(params) {
        const skip = (params.page - 1) * params.perPage;
        const [items, total] = await Promise.all([
            this.repository.findAll({
                skip,
                take: params.perPage,
                isPublished: true,
                include: { tokens: true },
            }),
            this.repository.count(),
        ]);
        return {
            items,
            meta: {
                page: params.page,
                perPage: params.perPage,
                total,
                pages: Math.ceil(total / params.perPage),
            },
        };
    }
    async getPaletteById(id) {
        const palette = await this.repository.findById(id, { include: { tokens: true } });
        if (!palette)
            throw new Error('Palette not found');
        return palette;
    }
    async createPalette(data) {
        return this.repository.create({
            ...data,
            tokens: {
                createMany: {
                    data: data.tokens,
                },
            },
        });
    }
    async updatePalette(id, data) {
        return this.repository.update(id, data);
    }
    async publishPalette(id) {
        return this.repository.update(id, { isPublished: true });
    }
    async deletePalette(id) {
        await this.repository.delete(id);
    }
}
exports.PaletteService = PaletteService;
//# sourceMappingURL=palette.service.js.map