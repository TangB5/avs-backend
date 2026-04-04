"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const CreateSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(2000),
    rating: zod_1.z.number().min(0).max(5).optional(),
});
const QuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    perPage: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
class CommentController {
    service;
    constructor(service) {
        this.service = service;
    }
    addComment = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { patternId, artisanId } = req.params;
            const data = CreateSchema.parse(req.body);
            const comment = await this.service.addComment(userId, patternId || null, artisanId || null, data);
            res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_types_1.ok)(comment, 'Comment added'));
        }
        catch (err) {
            next(err);
        }
    };
    getComments = async (req, res, next) => {
        try {
            const query = QuerySchema.parse(req.query);
            const { patternId, artisanId } = req.params;
            const result = await this.service.getComments(patternId || undefined, artisanId || undefined, {
                page: query.page,
                perPage: query.perPage,
            });
            res.json((0, api_types_1.ok)(result.items, 'Comments retrieved', result.meta));
        }
        catch (err) {
            next(err);
        }
    };
    deleteComment = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            await this.service.deleteComment(req.params['id'] ?? '', userId);
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.CommentController = CommentController;
//# sourceMappingURL=comment.controller.js.map