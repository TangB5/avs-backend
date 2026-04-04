"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCurator = exports.requireAdmin = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../errors/AppError");
// ── Middleware d'authentification ─────────────────────────────────────────────
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError_1.UnauthorizedError('Token manquant ou format invalide');
        }
        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET non configuré');
        }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new AppError_1.UnauthorizedError('Token expiré'));
        }
        else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new AppError_1.UnauthorizedError('Token invalide'));
        }
        else {
            next(err);
        }
    }
};
exports.authenticate = authenticate;
// ── Guard par rôle ────────────────────────────────────────────────────────────
const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user) {
        return next(new AppError_1.UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
        return next(new AppError_1.ForbiddenError(`Rôle requis : ${roles.join(' ou ')}`));
    }
    next();
};
exports.requireRole = requireRole;
// ── Guard admin raccourci ─────────────────────────────────────────────────────
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireCurator = (0, exports.requireRole)('admin', 'curator');
//# sourceMappingURL=auth.middleware.js.map