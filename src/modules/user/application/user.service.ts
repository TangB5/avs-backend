import type { User } from '@prisma/client';
import type { IRepository } from '@/shared/types/repository.types';
import { PrismaClient } from '@prisma/client';

export interface UpdateUserDto {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  specialty?: string;
  avatar?: string;
}

export interface UserPattern {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: 'published' | 'draft' | 'review';
  views: number;
  downloads: number;
  imgUrl: string;
}

export interface UserActivity {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface UserStats {
  patternsCount: number;
  downloadsTotal: number;
  viewsTotal: number;
  favoritesCount: number;
  commentsCount: number;
}

export class UserService {
  constructor(
    private readonly repository: IRepository<User>,
    private readonly db: PrismaClient,
  ) {}

  async getUserById(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const user = await this.repository.update(userId, data);
    return user;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error('User not found');

    // Count comments by this user
    const commentsCount = await this.db.comment.count({
      where: { userId },
    });

    return {
      patternsCount: 0,
      downloadsTotal: 0,
      viewsTotal: 0,
      favoritesCount: 0,
      commentsCount,
    };
  }

  async getUserPatterns(userId: string, limit: number = 5): Promise<UserPattern[]> {
    // Fetch recent patterns
    // Note: Pattern model doesn't have createdById yet, so returning empty for now
    // Once Pattern model is updated with user relationship, implement this
    return [];
  }

  async getUserActivity(userId: string, limit: number = 6): Promise<UserActivity[]> {
    const activities = await this.db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      targetType: activity.targetType,
      targetId: activity.targetId,
      createdAt: activity.createdAt.toISOString(),
    }));
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  async verifyUser(userId: string): Promise<User> {
    return this.repository.update(userId, { verified: true });
  }
}

