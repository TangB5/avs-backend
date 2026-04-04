import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/modules/auth/application/auth.service';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private setAuthCookies;
}
//# sourceMappingURL=auth.controller.d.ts.map