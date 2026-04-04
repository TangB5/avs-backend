import { PrismaClient, Template } from '@prisma/client';
export declare class PrismaTemplateRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findById(id: string): Promise<Template | null>;
    findFiltered(params: {
        skip?: number;
        take?: number;
        category?: string;
        framework?: string;
        isPublished?: boolean;
    }): Promise<Template[]>;
    countFiltered(params: {
        category?: string;
        framework?: string;
        isPublished?: boolean;
    }): Promise<number>;
    findFeatured(limit: number): Promise<Template[]>;
}
//# sourceMappingURL=PrismaTemplateRepository.d.ts.map