import type { Prisma } from '@prisma/client';
import { PrismaClient, User } from '@prisma/client';
export declare class PrismaUserRepository {
    private readonly db;
    constructor(db: PrismaClient);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(params?: {
        take?: number;
        skip?: number;
    }): Promise<User[]>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    delete(id: string): Promise<User>;
    countPatterns(userId: string): Promise<number>;
    countDownloads(userId: string): Promise<number>;
    countViews(userId: string): Promise<number>;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map