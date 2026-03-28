import type { RequestHandler, Request } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   'viewer' | 'contributor' | 'curator' | 'admin';
  iat:    number;
  exp:    number;
}

// Étend le type Request Express
declare module 'express-serve-static-core' {
  interface Request { user?: JwtPayload; }
}

// ── Middleware d'authentification ─────────────────────────────────────────────
export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token manquant ou format invalide');
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) { throw new Error('JWT_SECRET non configuré'); }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expiré'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Token invalide'));
    } else {
      next(err);
    }
  }
};

// ── Guard par rôle ────────────────────────────────────────────────────────────
export const requireRole = (...roles: JwtPayload['role'][]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) { return next(new UnauthorizedError()); }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Rôle requis : ${roles.join(' ou ')}`));
    }
    next();
  };

// ── Guard admin raccourci ─────────────────────────────────────────────────────
export const requireAdmin: RequestHandler = requireRole('admin');
export const requireCurator: RequestHandler = requireRole('admin', 'curator');
