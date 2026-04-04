import type { Prisma } from '@prisma/client';
import { PrismaClient, Comment } from '@prisma/client';
export declare class PrismaCommentRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findById(id: string): Promise<Comment | null>;
    findByTarget(target: {
        patternId?: string;
        artisanId?: string;
    }, params?: {
        skip?: number;
        take?: number;
    }): Promise<Comment[]>;
    countByTarget(target: {
        patternId?: string;
        artisanId?: string;
    }): Promise<number>;
    create(data: Prisma.CommentCreateInput): Promise<Comment>;
    update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment>;
    delete(id: string): Promise<Comment>;
}
//# sourceMappingURL=PrismaCommentRepository.d.ts.map