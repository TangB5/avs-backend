import { PrismaClient, Template } from '@prisma/client';

export class PrismaTemplateRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Template | null> {
    return this.db.template.findUnique({ where: { id } });
  }

  async findFiltered(params: {
    skip?: number;
    take?: number;
    category?: string;
    framework?: string;
    isPublished?: boolean;
  }): Promise<Template[]> {
    return this.db.template.findMany({
      skip: params.skip,
      take: params.take ?? 20,
      where: {
        ...(params.category && { category: params.category }),
        ...(params.framework && { framework: params.framework }),
        ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countFiltered(params: {
    category?: string;
    framework?: string;
    isPublished?: boolean;
  }): Promise<number> {
    return this.db.template.count({
      where: {
        ...(params.category && { category: params.category }),
        ...(params.framework && { framework: params.framework }),
        ...(params.isPublished !== undefined && { isPublished: params.isPublished }),
      },
    });
  }

  async findFeatured(limit: number): Promise<Template[]> {
    return this.db.template.findMany({
      where: { isFeatured: true, isPublished: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
