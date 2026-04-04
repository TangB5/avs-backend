import type { Prisma } from '@prisma/client';
import { PrismaClient, Activity } from '@prisma/client';
export declare class PrismaActivityRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findByUser(userId: string, params?: {
        skip?: number;
        take?: number;
    }): Promise<Activity[]>;
    countByUser(userId: string): Promise<number>;
    create(data: Prisma.ActivityCreateInput): Promise<Activity>;
    getGlobalStats(): Promise<{
        totalPatterns: number;
        totalUsers: number;
        totalArtisans: number;
        totalDownloads: number;
    }>;
}
//# sourceMappingURL=PrismaActivityRepository.d.ts.map