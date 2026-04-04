"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultureController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
// ── Schémas Zod ───────────────────────────────────────────────────────────────
const CreateSchema = zod_1.z.object({
    nameFr: zod_1.z.string().min(2).max(128),
    nameEn: zod_1.z.string().min(2).max(128),
    descFr: zod_1.z.string().min(10).max(2000),
    descEn: zod_1.z.string().min(10).max(2000),
    patternType: zod_1.z.enum(['kente', 'bogolan', 'adinkra', 'ndebele', 'kuba', 'ndop', 'wax']),
    region: zod_1.z.enum(['west-africa', 'east-africa', 'central-africa', 'north-africa', 'south-africa', 'diaspora']),
    country: zod_1.z.string().length(2).toUpperCase(),
    colors: zod_1.z.object({
        primary: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        secondary: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        accent: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }),
    symbolism: zod_1.z.object({
        meaning: zod_1.z.string().max(512),
        keywords: zod_1.z.array(zod_1.z.string().max(32)).min(1).max(10),
        usage: zod_1.z.enum(['ceremonial', 'daily', 'royal', 'spiritual', 'universal']),
    }),
});
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    region: zod_1.z.string().optional(),
    patternType: zod_1.z.string().optional(),
    search: zod_1.z.string().max(128).optional(),
});
// ── Factory — injection du service ───────────────────────────────────────────
class CultureController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (req, res, next) => {
        try {
            const query = QuerySchema.parse(req.query);
            const result = await this.service.listPatterns(query, req.user?.userId);
            res.json((0, api_types_1.ok)(result.items, 'OK', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    getBySlug = async (req, res, next) => {
        try {
            const pattern = await this.service.getPatternBySlug(req.params['slug'] ?? '');
            res.json((0, api_types_1.ok)(pattern.toObject()));
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const dto = CreateSchema.parse(req.body);
            const pattern = await this.service.createPattern({ ...dto, createdById: req.user.userId });
            res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_types_1.ok)(pattern.toObject(), 'Motif créé'));
        }
        catch (err) {
            next(err);
        }
    };
    publish = async (req, res, next) => {
        try {
            const pattern = await this.service.publishPattern(req.params['id'] ?? '', req.user.userId, req.user.role);
            res.json((0, api_types_1.ok)(pattern.toObject(), 'Motif publié'));
        }
        catch (err) {
            next(err);
        }
    };
    remove = async (req, res, next) => {
        try {
            await this.service.deletePattern(req.params['id'] ?? '', req.user.role);
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.CultureController = CultureController;
//# sourceMappingURL=culture.controller.js.map