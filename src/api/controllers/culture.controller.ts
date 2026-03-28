import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CultureService } from '@/modules/culture/application/culture.service';
import { ok } from '@/shared/types/api.types';
import { StatusCodes } from 'http-status-codes';

// ── Schémas Zod ───────────────────────────────────────────────────────────────
const CreateSchema = z.object({
  nameFr:      z.string().min(2).max(128),
  nameEn:      z.string().min(2).max(128),
  descFr:      z.string().min(10).max(2000),
  descEn:      z.string().min(10).max(2000),
  patternType: z.enum(['kente','bogolan','adinkra','ndebele','kuba','ndop','wax']),
  region:      z.enum(['west-africa','east-africa','central-africa','north-africa','south-africa','diaspora']),
  country:     z.string().length(2).toUpperCase(),
  colors:      z.object({
    primary:    z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary:  z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent:     z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  symbolism:   z.object({
    meaning:  z.string().max(512),
    keywords: z.array(z.string().max(32)).min(1).max(10),
    usage:    z.enum(['ceremonial','daily','royal','spiritual','universal']),
  }),
});

const QuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  perPage:     z.coerce.number().int().min(1).max(100).default(20),
  region:      z.string().optional(),
  patternType: z.string().optional(),
  search:      z.string().max(128).optional(),
});

// ── Factory — injection du service ───────────────────────────────────────────
export class CultureController {
  constructor(private readonly service: CultureService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      const result = await this.service.listPatterns(query, req.user?.userId);
      res.json(ok(result.items, 'OK', result.meta));
    } catch (err) { next(err); }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pattern = await this.service.getPatternBySlug(req.params['slug'] ?? '');
      res.json(ok(pattern.toObject()));
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateSchema.parse(req.body);
      const pattern = await this.service.createPattern({ ...dto, createdById: req.user!.userId });
      res.status(StatusCodes.CREATED).json(ok(pattern.toObject(), 'Motif créé'));
    } catch (err) { next(err); }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pattern = await this.service.publishPattern(
        req.params['id'] ?? '', req.user!.userId, req.user!.role
      );
      res.json(ok(pattern.toObject(), 'Motif publié'));
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deletePattern(req.params['id'] ?? '', req.user!.role);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) { next(err); }
  };
}
