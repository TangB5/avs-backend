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
  target: string;
  timestamp: string;
  type: 'comment' | 'download' | 'review' | 'favorite';
}

export interface UserStats {
  patternsCount: number;
  downloadsTotal: number;
  viewsTotal: number;
  favoritesCount: number;
  commentsCount: number;
  trends: {
    patternsTrend: string;
    downloadsTrend: string;
    viewsTrend: string;
    favoritesTrend: string;
  };
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

    // Current month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count patterns by this user
    const patternsCount = await this.db.pattern.count({
      where: { createdById: userId },
    });

    // Sum downloads and views from user's patterns
    const patterns = await this.db.pattern.findMany({
      where: { createdById: userId },
      select: { downloads: true, views: true },
    });

    const downloadsTotal = patterns.reduce((sum, p) => sum + (p.downloads || 0), 0);
    const viewsTotal = patterns.reduce((sum, p) => sum + (p.views || 0), 0);

    // Count comments by this user
    const commentsCount = await this.db.comment.count({
      where: { userId },
    });

    // Count favorites (activities with FAVORITED action)
    const favoritesCount = await this.db.activity.count({
      where: { userId, action: 'FAVORITED' },
    });

    // Calculate trends - compare current month vs last month
    const patternsThisMonth = await this.db.pattern.count({
      where: {
        createdById: userId,
        createdAt: { gte: currentMonthStart },
      },
    });

    const patternsLastMonth = await this.db.pattern.count({
      where: {
        createdById: userId,
        createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
      },
    });

    const patternsDiff = patternsThisMonth - patternsLastMonth;
    const patternsTrend = patternsDiff >= 0 ? `+${patternsDiff} ce mois` : `${patternsDiff} ce mois`;

    // Downloads trend (using activity data)
    const downloadsThisMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'DOWNLOADED',
        createdAt: { gte: currentMonthStart },
      },
    });

    const downloadsLastMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'DOWNLOADED',
        createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
      },
    });

    const downloadsTrend = downloadsLastMonth > 0
      ? `${Math.round(((downloadsThisMonth - downloadsLastMonth) / downloadsLastMonth) * 100)}% vs mois dernier`
      : '+0% vs mois dernier';

    // Views trend (using activity data)
    const viewsThisMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'CREATED', // Assuming CREATED represents views for now
        createdAt: { gte: currentMonthStart },
      },
    });

    const viewsLastMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'CREATED',
        createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
      },
    });

    const viewsDiff = viewsThisMonth - viewsLastMonth;
    const viewsTrend = viewsDiff >= 0 ? `+${viewsDiff} ce mois` : `${viewsDiff} ce mois`;

    // Favorites trend
    const favoritesThisMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'FAVORITED',
        createdAt: { gte: currentMonthStart },
      },
    });

    const favoritesLastMonth = await this.db.activity.count({
      where: {
        userId,
        action: 'FAVORITED',
        createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
      },
    });

    const favoritesDiff = favoritesThisMonth - favoritesLastMonth;
    const favoritesTrend = favoritesDiff >= 0 ? `+${favoritesDiff} nouveaux` : `${favoritesDiff} nouveaux`;

    return {
      patternsCount,
      downloadsTotal,
      viewsTotal,
      favoritesCount,
      commentsCount,
      trends: {
        patternsTrend,
        downloadsTrend,
        viewsTrend,
        favoritesTrend,
      },
    };
  }

  async getUserPatterns(userId: string, limit: number = 5): Promise<UserPattern[]> {
    const patterns = await this.db.pattern.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        views: true,
        downloads: true,
        imgUrl: true,
      },
    });

    return patterns.map((pattern) => ({
      id: pattern.id,
      name: pattern.name,
      slug: pattern.slug,
      type: pattern.type,
      status: pattern.status.toLowerCase() as 'published' | 'draft' | 'review',
      views: pattern.views || 0,
      downloads: pattern.downloads || 0,
      imgUrl: pattern.imgUrl,
    }));
  }

  async getUserActivity(userId: string, limit: number = 6): Promise<UserActivity[]> {
    const activities = await this.db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Map ActivityAction to frontend type and action label
    const actionConfig: Record<string, { type: 'comment' | 'download' | 'review' | 'favorite'; label: string }> = {
      COMMENTED: { type: 'comment', label: 'Commentaire sur' },
      DOWNLOADED: { type: 'download', label: 'Téléchargement de' },
      REVIEWED: { type: 'review', label: 'Validation approuvée —' },
      FAVORITED: { type: 'favorite', label: 'Favori ajouté sur' },
    };

    const result: UserActivity[] = [];

    for (const activity of activities) {
      const config = actionConfig[activity.action];
      if (!config) continue;

      // Fetch pattern name if target is a pattern
      let targetName = activity.targetId;
      if (activity.targetType === 'pattern' || activity.targetType === 'Pattern') {
        const pattern = await this.db.pattern.findUnique({
          where: { id: activity.targetId },
          select: { name: true },
        });
        if (pattern) targetName = pattern.name;
      }

      result.push({
        id: activity.id,
        action: config.label,
        target: targetName,
        timestamp: activity.createdAt.toISOString(),
        type: config.type,
      });
    }

    return result;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  async verifyUser(userId: string): Promise<User> {
    return this.repository.update(userId, { verified: true });
  }
}

