import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '@/modules/auth/application/auth.service';
import { ok } from '@/shared/types/api.types';
import { StatusCodes } from 'http-status-codes';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(64),
});

export class AuthController {
  constructor(private readonly service: AuthService) {}

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await this.service.register(data);

      // 🔥 SET COOKIES (IMPORTANT)
      this.setAuthCookies(res, result.tokens);

      res.status(StatusCodes.CREATED).json(
        ok({ user: result.user, tokens: result.tokens }, 'User registered successfully')
      );
    } catch (err) {
      next(err);
    }
  };

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await this.service.login(data);

      // 🔥 SET COOKIES (CRITICAL FIX)
      this.setAuthCookies(res, result.tokens);

      res.json(
        ok({ user: result.user, tokens: result.tokens }, 'Login successful')
      );
    } catch (err) {
      next(err);
    }
  };

  
  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 🔥 CLEAR COOKIES
      res.clearCookie('avs_session');
      res.clearCookie('avs_refresh');

      res.json(ok(null, 'Logout successful'));
    } catch (err) {
      next(err);
    }
  };

  // ─────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.avs_refresh || req.body.refreshToken;

      if (!refreshToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token required',
        });
        return;
      }

      const result = await this.service.refreshToken(refreshToken);

      // 🔥 UPDATE COOKIES
      this.setAuthCookies(res, result.tokens);

      res.json(ok({ user: result.user, tokens: result.tokens }, 'Token refreshed'));
    } catch (err) {
      next(err);
    }
  };

  // ─────────────────────────────────────────
  // COOKIE HELPER (IMPORTANT)
  // ─────────────────────────────────────────
  private setAuthCookies(res: Response, tokens: any) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('avs_session', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,        // true en prod HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    res.cookie('avs_refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
  }
}