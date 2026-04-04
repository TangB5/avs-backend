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

/**
 * Middleware d'authentification
 * Support deux sources de token:
 * 1. Cookie httpOnly: avs_session (préféré, plus sécurisé)
 * 2. Header Authorization: Bearer <token> (fallback pour API clients)
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    // 1. Essayer le token depuis le cookie httpOnly (priorité)
    let token = req.cookies?.avs_session;

    // 2. Fallback: token depuis Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      throw new UnauthorizedError('Token manquant ou format invalide');
    }

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

export const requireCurator = requireRole('curator', 'admin');
export const requireAdmin = requireRole('admin');
