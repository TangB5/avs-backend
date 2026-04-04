import type { Request, Response, NextFunction } from 'express';
import { PaletteService } from '@/modules/palette/application/palette.service';
export declare class PaletteController {
    private readonly service;
    constructor(service: PaletteService);
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    publish: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=palette.controller.d.ts.map