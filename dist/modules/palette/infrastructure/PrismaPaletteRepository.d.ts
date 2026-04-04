import type { Prisma } from '@prisma/client';
import { PrismaClient, Palette } from '@prisma/client';
export declare class PrismaPaletteRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findById(id: string, params?: {
        include?: any;
    }): Promise<Palette | null>;
    findAll(params: {
        skip?: number;
        take?: number;
        isPublished?: boolean;
        include?: any;
    }): Promise<Palette[]>;
    count(): Promise<number>;
    create(data: Prisma.PaletteCreateInput): Promise<Palette>;
    update(id: string, data: Prisma.PaletteUpdateInput): Promise<Palette>;
    delete(id: string): Promise<Palette>;
}
//# sourceMappingURL=PrismaPaletteRepository.d.ts.map