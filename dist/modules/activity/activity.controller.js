"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
class ActivityController {
    service;
    constructor(service) {
        this.service = service;
    }
    getUserActivity = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const query = QuerySchema.parse(req.query);
            const result = await this.service.getUserActivity(userId, query);
            res.json((0, api_types_1.ok)(result.items, 'Activity retrieved', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    getGlobalStats = async (req, res, next) => {
        try {
            const stats = await this.service.getGlobalStats();
            res.json((0, api_types_1.ok)(stats, 'Global statistics'));
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ActivityController = ActivityController;
//# sourceMappingURL=activity.controller.js.map