import type { Activity } from '@prisma/client';
export interface ActivityListParams {
    page: number;
    perPage: number;
}
export declare class ActivityService {
    private readonly repository;
    constructor(repository: any);
    getUserActivity(userId: string, params: ActivityListParams): Promise<{
        items: Activity[];
        meta: {
            page: number;
            perPage: number;
            total: number;
        };
    }>;
    logActivity(userId: string, action: string, targetId: string, targetType: string, metadata?: any): Promise<Activity>;
    getGlobalStats(): Promise<{
        totalPatterns: number;
        totalUsers: number;
        totalArtisans: number;
        totalDownloads: number;
    }>;
}
//# sourceMappingURL=activity.service.d.ts.map