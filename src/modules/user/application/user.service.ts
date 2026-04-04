import type { User } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import type { IRepository } from '@/shared/types/repository.types';
import { db } from '@/config/database';

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
  type: string;
  status: 'published' | 'draft' | 'review';
  viewCount: number;
  downloadCount: number;
}

export interface UserActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'comment' | 'download' | 'review' | 'favorite';
}

export class UserService {
  constructor(private readonly repository: IRepository<User>) {}

  async getUserById(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const user = await this.repository.update(userId, data);
    return user;
  }

  async getUserStats(userId: string): Promise<{
    patternsCount: number;
    downloadsTotal: number;
    viewsTotal: number;
    favoritesCount: number;
  }> {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error('User not found');
    
    // For now, return structure - will be updated when models are available
    return {
      patternsCount: 0,
      downloadsTotal: 0,
      viewsTotal: 0,
      favoritesCount: 0,
    };
  }

  async getUserPatterns(userId: string, limit: number = 5): Promise<UserPattern[]> {
    // Placeholder - will fetch from Pattern model when available
    // For now return empty array
    return [];
  }

  async getUserActivity(userId: string, limit: number = 6): Promise<UserActivity[]> {
    // Placeholder - will fetch from Activity model when available
    // For now return empty array
    return [];
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  async verifyUser(userId: string): Promise<User> {
    return this.repository.update(userId, { verified: true });
  }
}
