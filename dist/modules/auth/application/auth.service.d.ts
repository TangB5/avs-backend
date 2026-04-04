import { PrismaUserRepository } from '@/modules/user/infrastructure/PrismaUserRepository';
import type { User, Role } from '@prisma/client';
export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: Omit<User, 'passwordHash'>;
    tokens: AuthTokens;
}
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtSecret;
    private readonly accessExpiry;
    private readonly refreshExpiry;
    constructor(userRepository: PrismaUserRepository);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    validateAccessToken(token: string): Promise<any>;
    refreshToken(token: string): Promise<AuthResponse>;
    private generateAuthResponse;
}
//# sourceMappingURL=auth.service.d.ts.map