import type { Request, Response, NextFunction } from 'express';
import { ActivityService } from '@/modules/activity/application/activity.service';
export declare class ActivityController {
    private readonly service;
    constructor(service: ActivityService);
    getUserActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getGlobalStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=activity.controller.d.ts.map