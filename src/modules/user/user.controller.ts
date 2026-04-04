import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '@/modules/user/application/user.service';
import { ok } from '@/shared/types/api.types';
import { StatusCodes } from 'http-status-codes';

const UpdateSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  bio: z.string().max(280).optional(),
  location: z.string().max(64).optional(),
  website: z.string().url().optional().or(z.literal('')),
  github: z.string().max(39).optional(),
  twitter: z.string().max(15).optional(),
  specialty: z.string().max(64).optional(),
  avatar: z.string().optional(),
});

export class UserController {
  constructor(private readonly service: UserService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await this.service.getUserById(userId);

      // Refresh session cookie (httpOnly) on each /me request
      this.refreshSessionCookie(req, res);

      res.json(ok(user, 'User retrieved'));
    } catch (err) {
      next(err);
    }
  };

  private refreshSessionCookie(req: Request, res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      res.cookie('avs_session', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });
    }
  }

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const stats = await this.service.getUserStats(userId);
      res.json(ok(stats, 'Stats retrieved'));
    } catch (err) {
      next(err);
    }
  };

  getPatterns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const limit = Math.min(Number(req.query.limit) || 5, 50);
      const patterns = await this.service.getUserPatterns(userId, limit);
      res.json(ok(patterns, 'Patterns retrieved'));
    } catch (err) {
      next(err);
    }
  };

  getActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const limit = Math.min(Number(req.query.limit) || 6, 50);
      const activity = await this.service.getUserActivity(userId, limit);
      res.json(ok(activity, 'Activity retrieved'));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const data = UpdateSchema.parse(req.body);
      const user = await this.service.updateUser(userId, data);
      res.json(ok(user, 'User updated'));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await this.service.deleteUser(userId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
