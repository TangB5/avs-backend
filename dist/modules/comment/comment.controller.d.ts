import type { Request, Response, NextFunction } from 'express';
import { CommentService } from '@/modules/comment/application/comment.service';
export declare class CommentController {
    private readonly service;
    constructor(service: CommentService);
    addComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=comment.controller.d.ts.map