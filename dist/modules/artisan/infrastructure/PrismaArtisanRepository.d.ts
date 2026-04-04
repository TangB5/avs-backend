import type { Prisma } from '@prisma/client';
import { PrismaClient, Artisan } from '@prisma/client';
export declare class PrismaArtisanRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findById(id: string): Promise<Artisan | null>;
    findAll(params?: {
        take?: number;
        skip?: number;
    }): Promise<Artisan[]>;
    findFiltered(params: {
        skip?: number;
        take?: number;
        search?: string;
        specialty?: string;
    }): Promise<Artisan[]>;
    countFiltered(params: {
        search?: string;
        specialty?: string;
    }): Promise<number>;
    create(data: Prisma.ArtisanCreateInput): Promise<Artisan>;
    update(id: string, data: Prisma.ArtisanUpdateInput): Promise<Artisan>;
    delete(id: string): Promise<Artisan>;
}
//# sourceMappingURL=PrismaArtisanRepository.d.ts.map