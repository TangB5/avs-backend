import type { RequestHandler } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    role: 'viewer' | 'contributor' | 'curator' | 'admin';
    iat: number;
    exp: number;
}
declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}
export declare const authenticate: RequestHandler;
export declare const requireRole: (...roles: JwtPayload["role"][]) => RequestHandler;
export declare const requireAdmin: RequestHandler;
export declare const requireCurator: RequestHandler;
//# sourceMappingURL=auth.middleware.d.ts.map