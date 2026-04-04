"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
const http_status_codes_1 = require("http-status-codes");
class AppError extends Error {
    message;
    statusCode;
    code;
    details;
    constructor(message, statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} introuvable`, http_status_codes_1.StatusCodes.NOT_FOUND, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(details) {
        super('Données invalides', http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Non autorisé') {
        super(message, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Accès refusé') {
        super(message, http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(resource) {
        super(`${resource} existe déjà`, http_status_codes_1.StatusCodes.CONFLICT, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=AppError.js.map