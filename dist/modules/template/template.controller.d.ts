import type { Request, Response, NextFunction } from 'express';
import { TemplateService } from '@/modules/template/application/template.service';
export declare class TemplateController {
    private readonly service;
    constructor(service: TemplateService);
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    featured: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=template.controller.d.ts.map