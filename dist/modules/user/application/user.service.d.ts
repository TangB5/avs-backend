import type { User } from '@prisma/client';
import type { IRepository } from '@/shared/types/repository.types';
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
export declare class UserService {
    private readonly repository;
    constructor(repository: IRepository<User>);
    getUserById(userId: string): Promise<User>;
    updateUser(userId: string, data: UpdateUserDto): Promise<User>;
    getUserStats(userId: string): Promise<{
        patternsCount: number;
        downloadsTotal: number;
        viewsTotal: number;
        favoritesCount: number;
    }>;
    getUserPatterns(userId: string, limit?: number): Promise<UserPattern[]>;
    getUserActivity(userId: string, limit?: number): Promise<UserActivity[]>;
    deleteUser(userId: string): Promise<void>;
    verifyUser(userId: string): Promise<User>;
}
//# sourceMappingURL=user.service.d.ts.map