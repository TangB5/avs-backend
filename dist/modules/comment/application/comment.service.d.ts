import type { Comment } from '@prisma/client';
export interface CreateCommentDto {
    content: string;
    rating?: number;
}
export declare class CommentService {
    private readonly repository;
    constructor(repository: any);
    addComment(userId: string, patternId: string | null, artisanId: string | null, data: CreateCommentDto): Promise<Comment>;
    getComments(patternId?: string, artisanId?: string, params?: {
        page?: number;
        perPage?: number;
    }): Promise<{
        items: Comment[];
        meta: {
            total: number;
            page: number;
            pages: number;
        };
    }>;
    deleteComment(commentId: string, userId: string): Promise<void>;
    verifyComment(commentId: string): Promise<Comment>;
}
//# sourceMappingURL=comment.service.d.ts.map