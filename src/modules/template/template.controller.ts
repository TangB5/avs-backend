import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TemplateService } from '@/modules/template/application/template.service';
import { ok } from '@/shared/types/api.types';
import { StatusCodes } from 'http-status-codes';

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  framework: z.string().optional(),
});

export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      const result = await this.service.listTemplates(query);
      res.json(ok(result.items, 'OK', result.meta));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.service.getTemplateById(req.params['id'] ?? '');
      res.json(ok(template, 'Template retrieved'));
    } catch (err) {
      next(err);
    }
  };

  featured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.service.getFeatured();
      res.json(ok(templates, 'Featured templates'));
    } catch (err) {
      next(err);
    }
  };
}
