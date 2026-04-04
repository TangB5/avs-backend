"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    category: zod_1.z.string().optional(),
    framework: zod_1.z.string().optional(),
});
class TemplateController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (req, res, next) => {
        try {
            const query = QuerySchema.parse(req.query);
            const result = await this.service.listTemplates(query);
            res.json((0, api_types_1.ok)(result.items, 'OK', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const template = await this.service.getTemplateById(req.params['id'] ?? '');
            res.json((0, api_types_1.ok)(template, 'Template retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    featured = async (req, res, next) => {
        try {
            const templates = await this.service.getFeatured();
            res.json((0, api_types_1.ok)(templates, 'Featured templates'));
        }
        catch (err) {
            next(err);
        }
    };
}
exports.TemplateController = TemplateController;
//# sourceMappingURL=template.controller.js.map