import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { StatusCodes } from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorFilter: ErrorRequestHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string | undefined;

  // Zod → ValidationError
  if (err instanceof ZodError) {
    const validationErr = new ValidationError(err.flatten().fieldErrors);
    return res.status(validationErr.statusCode).json({
      success: false,
      message: validationErr.message,
      code:    validationErr.code,
      details: validationErr.details,
      requestId,
    });
  }

  // AppError (domaine)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('[AppError]', { message: err.message, stack: err.stack, requestId });
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code:    err.code,
      ...(process.env.NODE_ENV !== 'production' && { details: err.details }),
      requestId,
    });
  }

  // CORS Error
  if (err instanceof Error && err.message.startsWith('CORS:')) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false, message: err.message, code: 'CORS_ERROR', requestId,
    });
  }

  // Erreur inconnue
  logger.error('[UnhandledError]', { err, requestId });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : String(err),
    code: 'INTERNAL_ERROR',
    requestId,
  });
};

// ── 404 handler ───────────────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
};
