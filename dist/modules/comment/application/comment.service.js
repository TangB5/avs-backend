"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
class CommentService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async addComment(userId, patternId, artisanId, data) {
        if (!patternId && !artisanId) {
            throw new Error('Either patternId or artisanId must be provided');
        }
        return this.repository.create({
            userId,
            patternId,
            artisanId,
            content: data.content,
            rating: data.rating,
            type: patternId ? 'PATTERN' : 'ARTISAN',
        });
    }
    async getComments(patternId, artisanId, params) {
        const page = params?.page ?? 1;
        const perPage = params?.perPage ?? 20;
        const skip = (page - 1) * perPage;
        const [items, total] = await Promise.all([
            this.repository.findByTarget({ patternId, artisanId }, { skip, take: perPage }),
            this.repository.countByTarget({ patternId, artisanId }),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                pages: Math.ceil(total / perPage),
            },
        };
    }
    async deleteComment(commentId, userId) {
        const comment = await this.repository.findById(commentId);
        if (!comment)
            throw new Error('Comment not found');
        if (comment.userId !== userId)
            throw new Error('Unauthorized');
        await this.repository.delete(commentId);
    }
    async verifyComment(commentId) {
        return this.repository.update(commentId, { verified: true });
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=comment.service.js.map