import type { Request, Response, NextFunction } from 'express';
import { CultureService } from '@/modules/culture/application/culture.service';
export declare class CultureController {
    private readonly service;
    constructor(service: CultureService);
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBySlug: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    publish: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    remove: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=culture.controller.d.ts.map