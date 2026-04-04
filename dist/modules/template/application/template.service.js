"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
class TemplateService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async listTemplates(params) {
        const skip = (params.page - 1) * params.perPage;
        const [items, total] = await Promise.all([
            this.repository.findFiltered({
                skip,
                take: params.perPage,
                category: params.category,
                framework: params.framework,
                isPublished: true,
            }),
            this.repository.countFiltered({
                category: params.category,
                framework: params.framework,
                isPublished: true,
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
    async getTemplateById(id) {
        const template = await this.repository.findById(id);
        if (!template)
            throw new Error('Template not found');
        return template;
    }
    async getFeatured() {
        return this.repository.findFeatured(5);
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=template.service.js.map