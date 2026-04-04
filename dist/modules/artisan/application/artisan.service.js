"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtisanService = void 0;
class ArtisanService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async listArtisans(params) {
        const skip = (params.page - 1) * params.perPage;
        const [items, total] = await Promise.all([
            this.repository.findFiltered({
                skip,
                take: params.perPage,
                search: params.search,
                specialty: params.specialty,
            }),
            this.repository.countFiltered({
                search: params.search,
                specialty: params.specialty,
            }),
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
    async getArtisanById(id) {
        const artisan = await this.repository.findById(id);
        if (!artisan)
            throw new Error('Artisan not found');
        return artisan;
    }
    async createArtisan(userId, data) {
        return this.repository.create({
            userId,
            ...data,
        });
    }
    async updateArtisan(id, data) {
        const artisan = await this.repository.update(id, data);
        return artisan;
    }
    async deleteArtisan(id) {
        await this.repository.delete(id);
    }
    async verifyArtisan(id) {
        return this.repository.update(id, { verified: true });
    }
    async updateRating(id, rating) {
        return this.repository.update(id, { rating });
    }
}
exports.ArtisanService = ArtisanService;
//# sourceMappingURL=artisan.service.js.map