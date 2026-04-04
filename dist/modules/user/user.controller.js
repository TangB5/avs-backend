"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const UpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(64).optional(),
    bio: zod_1.z.string().max(280).optional(),
    location: zod_1.z.string().max(64).optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    github: zod_1.z.string().max(39).optional(),
    twitter: zod_1.z.string().max(15).optional(),
    specialty: zod_1.z.string().max(64).optional(),
    avatar: zod_1.z.string().optional(),
});
class UserController {
    service;
    constructor(service) {
        this.service = service;
    }
    getMe = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const user = await this.service.getUserById(userId);
            // Refresh session cookie (httpOnly) on each /me request
            this.refreshSessionCookie(req, res);
            res.json((0, api_types_1.ok)(user, 'User retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    refreshSessionCookie(req, res) {
        const isProd = process.env.NODE_ENV === 'production';
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            res.cookie('avs_session', token, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24h
            });
        }
    }
    getStats = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const stats = await this.service.getUserStats(userId);
            res.json((0, api_types_1.ok)(stats, 'Stats retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    getPatterns = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const limit = Math.min(Number(req.query.limit) || 5, 50);
            const patterns = await this.service.getUserPatterns(userId, limit);
            res.json((0, api_types_1.ok)(patterns, 'Patterns retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    getActivity = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const limit = Math.min(Number(req.query.limit) || 6, 50);
            const activity = await this.service.getUserActivity(userId, limit);
            res.json((0, api_types_1.ok)(activity, 'Activity retrieved'));
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const data = UpdateSchema.parse(req.body);
            const user = await this.service.updateUser(userId, data);
            res.json((0, api_types_1.ok)(user, 'User updated'));
        }
        catch (err) {
            next(err);
        }
    };
    delete = async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            await this.service.deleteUser(userId);
            res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map