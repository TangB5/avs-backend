import type { Prisma } from '@prisma/client';
import { PrismaClient, Palette } from '@prisma/client';

export class PrismaPaletteRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string, params?: { include?: any }): Promise<Palette | null> {
    return this.db.palette.findUnique({
      where: { id },
      include: params?.include,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    isPublished?: boolean;
    include?: any;
  }): Promise<Palette[]> {
    return this.db.palette.findMany({
      skip: params.skip,
      take: params.take ?? 20,
      where: params.isPublished ? { isPublished: true } : {},
      include: params.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.db.palette.count({ where: { isPublished: true } });
  }

  async create(data: Prisma.PaletteCreateInput): Promise<Palette> {
    return this.db.palette.create({ data, include: { tokens: true } });
  }

  async update(id: string, data: Prisma.PaletteUpdateInput): Promise<Palette> {
    return this.db.palette.update({
      where: { id },
      data,
      include: { tokens: true },
    });
  }

  async delete(id: string): Promise<Palette> {
    return this.db.palette.delete({ where: { id } });
  }
}
