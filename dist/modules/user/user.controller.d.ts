import type { Request, Response, NextFunction } from 'express';
import { UserService } from '@/modules/user/application/user.service';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private refreshSessionCookie;
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPatterns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map