"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorFilter = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const logger_1 = require("../utils/logger");
const http_status_codes_1 = require("http-status-codes");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorFilter = (err, req, res, _next) => {
    const requestId = req.headers['x-request-id'];
    // Zod → ValidationError
    if (err instanceof zod_1.ZodError) {
        const validationErr = new AppError_1.ValidationError(err.flatten().fieldErrors);
        return res.status(validationErr.statusCode).json({
            success: false,
            message: validationErr.message,
            code: validationErr.code,
            details: validationErr.details,
            requestId,
        });
    }
    // AppError (domaine)
    if (err instanceof AppError_1.AppError) {
        if (err.statusCode >= 500) {
            logger_1.logger.error('[AppError]', { message: err.message, stack: err.stack, requestId });
        }
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
            ...(process.env.NODE_ENV !== 'production' && { details: err.details }),
            requestId,
        });
    }
    // CORS Error
    if (err instanceof Error && err.message.startsWith('CORS:')) {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false, message: err.message, code: 'CORS_ERROR', requestId,
        });
    }
    // Erreur inconnue
    logger_1.logger.error('[UnhandledError]', { err, requestId });
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : String(err),
        code: 'INTERNAL_ERROR',
        requestId,
    });
};
exports.errorFilter = errorFilter;
// ── 404 handler ───────────────────────────────────────────────────────────────
const notFoundHandler = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Route introuvable : ${req.method} ${req.path}`,
        code: 'NOT_FOUND',
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.filter.js.map