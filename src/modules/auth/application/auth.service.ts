import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaUserRepository } from '@/modules/user/infrastructure/PrismaUserRepository';
import { UnauthorizedError, ConflictError } from '@/shared/errors/AppError';
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

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  private readonly accessExpiry = '24h';
  private readonly refreshExpiry = '7d';

  constructor(private readonly userRepository: PrismaUserRepository) {}

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role || 'VIEWER',
    });

    return this.generateAuthResponse(user);
  }

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  // ─────────────────────────────────────────
  // TOKEN VALIDATION (middleware / api guard)
  // ─────────────────────────────────────────
  async validateAccessToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  // ─────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;

      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return this.generateAuthResponse(user);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  // ─────────────────────────────────────────
  // CORE TOKEN GENERATION
  // ─────────────────────────────────────────
  private generateAuthResponse(user: User): AuthResponse {
    const { passwordHash, ...safeUser } = user;

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: this.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtSecret,
      { expiresIn: this.refreshExpiry }
    );

    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60,
      },
    };
  }
}