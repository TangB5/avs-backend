import cors from 'cors';
import type { RequestHandler } from 'express';
export declare const helmetMiddleware: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const corsMiddleware: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare const globalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const publicApiRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const requestId: RequestHandler;
//# sourceMappingURL=security.middleware.d.ts.map