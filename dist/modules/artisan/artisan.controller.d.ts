import type { Request, Response, NextFunction } from 'express';
import { ArtisanService } from '@/modules/artisan/application/artisan.service';
export declare class ArtisanController {
    private readonly service;
    constructor(service: ArtisanService);
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verify: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=artisan.controller.d.ts.map