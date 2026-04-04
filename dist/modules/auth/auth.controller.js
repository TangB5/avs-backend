"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const api_types_1 = require("@/shared/types/api.types");
const http_status_codes_1 = require("http-status-codes");
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(2).max(64),
});
class AuthController {
    service;
    constructor(service) {
        this.service = service;
    }
    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────
    register = async (req, res, next) => {
        try {
            const data = RegisterSchema.parse(req.body);
            const result = await this.service.register(data);
            // 🔥 SET COOKIES (IMPORTANT)
            this.setAuthCookies(res, result.tokens);
            res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_types_1.ok)(result.user, 'User registered successfully'));
        }
        catch (err) {
            next(err);
        }
    };
    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────
    login = async (req, res, next) => {
        try {
            const data = LoginSchema.parse(req.body);
            const result = await this.service.login(data);
            // 🔥 SET COOKIES (CRITICAL FIX)
            this.setAuthCookies(res, result.tokens);
            console.log("BODY:", req.body);
            console.log("PASSWORD TYPE:", typeof req.body?.password);
            res.json((0, api_types_1.ok)(result.user, 'Login successful'));
        }
        catch (err) {
            next(err);
        }
    };
    // ─────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────
    logout = async (req, res, next) => {
        try {
            // 🔥 CLEAR COOKIES
            res.clearCookie('avs_session');
            res.clearCookie('avs_refresh');
            res.json((0, api_types_1.ok)(null, 'Logout successful'));
        }
        catch (err) {
            next(err);
        }
    };
    // ─────────────────────────────────────────
    // REFRESH TOKEN
    // ─────────────────────────────────────────
    refreshToken = async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.avs_refresh || req.body.refreshToken;
            if (!refreshToken) {
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Refresh token required',
                });
                return;
            }
            const result = await this.service.refreshToken(refreshToken);
            // 🔥 UPDATE COOKIES
            this.setAuthCookies(res, result.tokens);
            res.json((0, api_types_1.ok)(result.user, 'Token refreshed'));
        }
        catch (err) {
            next(err);
        }
    };
    // ─────────────────────────────────────────
    // COOKIE HELPER (IMPORTANT)
    // ─────────────────────────────────────────
    setAuthCookies(res, tokens) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('avs_session', tokens.accessToken, {
            httpOnly: true,
            secure: isProd, // true en prod HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24h
        });
        res.cookie('avs_refresh', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map