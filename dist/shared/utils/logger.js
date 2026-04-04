"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, colorize, printf, json } = winston_1.default.format;
const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => `${String(ts)} [${level}] ${String(message)} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`);
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    transports: [
        new winston_1.default.transports.Console(),
        ...(process.env.NODE_ENV === 'production' ? [
            new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
        ] : []),
    ],
});
//# sourceMappingURL=logger.js.map