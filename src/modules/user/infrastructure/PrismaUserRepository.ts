import type { Prisma } from '@prisma/client';
import { PrismaClient, User } from '@prisma/client';

export class PrismaUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findAll(params?: { take?: number; skip?: number }): Promise<User[]> {
    return this.db.user.findMany({
      take: params?.take ?? 10,
      skip: params?.skip ?? 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return this.db.user.delete({ where: { id } });
  }

  async countPatterns(userId: string): Promise<number> {
    return this.db.pattern.count({ where: { createdById: userId } });
  }

  async countDownloads(userId: string): Promise<number> {
    return this.db.pattern.aggregate({
      where: { createdById: userId },
      _sum: { downloadCount: true },
    }).then(r => r._sum?.downloadCount ?? 0);
  }

  async countViews(userId: string): Promise<number> {
    return this.db.pattern.aggregate({
      where: { createdById: userId },
      _sum: { viewCount: true },
    }).then(r => r._sum?.viewCount ?? 0);
  }
}
