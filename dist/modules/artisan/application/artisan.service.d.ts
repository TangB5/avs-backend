import type { Artisan } from '@prisma/client';
import type { IRepository } from '@/shared/types/repository.types';
export interface CreateArtisanDto {
    name: string;
    craft: string;
    origin: string;
    country: string;
    bio: string;
    specialties: string[];
}
export interface UpdateArtisanDto {
    name?: string;
    craft?: string;
    origin?: string;
    country?: string;
    bio?: string;
    specialties?: string[];
    rating?: number;
}
export interface ArtisanListParams {
    page: number;
    perPage: number;
    search?: string;
    specialty?: string;
}
export declare class ArtisanService {
    private readonly repository;
    constructor(repository: IRepository<Artisan>);
    listArtisans(params: ArtisanListParams): Promise<{
        items: Artisan[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            pages: number;
        };
    }>;
    getArtisanById(id: string): Promise<Artisan>;
    createArtisan(userId: string, data: CreateArtisanDto): Promise<Artisan>;
    updateArtisan(id: string, data: UpdateArtisanDto): Promise<Artisan>;
    deleteArtisan(id: string): Promise<void>;
    verifyArtisan(id: string): Promise<Artisan>;
    updateRating(id: string, rating: number): Promise<Artisan>;
}
//# sourceMappingURL=artisan.service.d.ts.map