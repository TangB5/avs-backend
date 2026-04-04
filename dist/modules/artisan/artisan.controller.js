"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtisanController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const CreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(128),
    craft: zod_1.z.string().min(2).max(128),
    origin: zod_1.z.string().min(2).max(128),
    country: zod_1.z.string().length(2).toUpperCase(),
    bio: zod_1.z.string().min(10).max(2000),
    specialties: zod_1.z.array(zod_1.z.string()).min(1).max(5),
});
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().max(128).optional(),
    specialty: zod_1.z.string().optional(),
});
class ArtisanController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (req, res, next) => {
        try {
            const query = QuerySchema.parse(req.query);
            const result = await this.service.listArtisans(query);
            res.json((0, api_types_1.ok)(result.items, 'OK', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const artisan = await this.service.getArtisanById(req.params['id'] ?? '');
            res.json((0, api_types_1.ok)(artisan, 'Artisan retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const data = CreateSchema.parse(req.body);
            const artisan = await this.service.createArtisan(userId, data);
            res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_types_1.ok)(artisan, 'Artisan created'));
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const data = CreateSchema.partial().parse(req.body);
            const artisan = await this.service.updateArtisan(req.params['id'] ?? '', data);
            res.json((0, api_types_1.ok)(artisan, 'Artisan updated'));
        }
        catch (err) {
            next(err);
        }
    };
    delete = async (req, res, next) => {
        try {
            await this.service.deleteArtisan(req.params['id'] ?? '');
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (err) {
            next(err);
        }
    };
    verify = async (req, res, next) => {
        try {
            const artisan = await this.service.verifyArtisan(req.params['id'] ?? '');
            res.json((0, api_types_1.ok)(artisan, 'Artisan verified'));
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ArtisanController = ArtisanController;
//# sourceMappingURL=artisan.controller.js.map