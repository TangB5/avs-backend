"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaletteController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const ColorTokenSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(64),
    hex: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    meaning: zod_1.z.string().max(256),
    origin: zod_1.z.string().max(128),
    css: zod_1.z.string().max(64),
});
const CreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(128),
    origin: zod_1.z.string().min(2).max(128),
    description: zod_1.z.string().min(10).max(1000),
    patternCSS: zod_1.z.string().optional(),
    tokens: zod_1.z.array(ColorTokenSchema).min(1).max(10),
});
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
class PaletteController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (req, res, next) => {
        try {
            const query = QuerySchema.parse(req.query);
            const result = await this.service.listPalettes(query);
            res.json((0, api_types_1.ok)(result.items, 'OK', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const palette = await this.service.getPaletteById(req.params['id'] ?? '');
            res.json((0, api_types_1.ok)(palette, 'Palette retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const data = CreateSchema.parse(req.body);
            const palette = await this.service.createPalette(data);
            res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_types_1.ok)(palette, 'Palette created'));
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const data = CreateSchema.partial().parse(req.body);
            const palette = await this.service.updatePalette(req.params['id'] ?? '', data);
            res.json((0, api_types_1.ok)(palette, 'Palette updated'));
        }
        catch (err) {
            next(err);
        }
    };
    publish = async (req, res, next) => {
        try {
            const palette = await this.service.publishPalette(req.params['id'] ?? '');
            res.json((0, api_types_1.ok)(palette, 'Palette published'));
        }
        catch (err) {
            next(err);
        }
    };
    delete = async (req, res, next) => {
        try {
            await this.service.deletePalette(req.params['id'] ?? '');
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.PaletteController = PaletteController;
//# sourceMappingURL=palette.controller.js.map