import { Router } from 'express';
import { TemplateController } from '@/modules/template/template.controller';
import { TemplateService } from '@/modules/template/application/template.service';
import { PrismaTemplateRepository } from '@/modules/template/infrastructure/PrismaTemplateRepository';
import { publicApiRateLimiter } from '@/shared/middlewares/security.middleware';
import { db } from '@/config/database';

const router = Router();

// Dependency Injection
const repository = new PrismaTemplateRepository(db);
const service = new TemplateService(repository);
const controller = new TemplateController(service);

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: List all published templates
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: framework
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/', publicApiRateLimiter, controller.list);

/**
 * @swagger
 * /api/v1/templates/featured:
 *   get:
 *     summary: Get featured templates
 *     responses:
 *       200:
 *         description: List of featured templates
 */
router.get('/featured', publicApiRateLimiter, controller.featured);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Template details with code and metadata
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', publicApiRateLimiter, controller.getById);

export default router;
