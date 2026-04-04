import type { Prisma } from '@prisma/client';
import { PrismaClient, Comment } from '@prisma/client';

export class PrismaCommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Comment | null> {
    return this.db.comment.findUnique({ where: { id } });
  }

  async findByTarget(
    target: { patternId?: string; artisanId?: string },
    params?: { skip?: number; take?: number }
  ): Promise<Comment[]> {
    return this.db.comment.findMany({
      where: {
        ...(target.patternId && { patternId: target.patternId }),
        ...(target.artisanId && { artisanId: target.artisanId }),
      },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async countByTarget(target: {
    patternId?: string;
    artisanId?: string;
  }): Promise<number> {
    return this.db.comment.count({
      where: {
        ...(target.patternId && { patternId: target.patternId }),
        ...(target.artisanId && { artisanId: target.artisanId }),
      },
    });
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.db.comment.create({
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.db.comment.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async delete(id: string): Promise<Comment> {
    return this.db.comment.delete({ where: { id } });
  }
}
