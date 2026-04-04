"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const template_controller_1 = require("@/modules/template/template.controller");
const template_service_1 = require("@/modules/template/application/template.service");
const PrismaTemplateRepository_1 = require("@/modules/template/infrastructure/PrismaTemplateRepository");
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaTemplateRepository_1.PrismaTemplateRepository(database_1.db);
const service = new template_service_1.TemplateService(repository);
const controller = new template_controller_1.TemplateController(service);
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
router.get('/', security_middleware_1.publicApiRateLimiter, controller.list);
/**
 * @swagger
 * /api/v1/templates/featured:
 *   get:
 *     summary: Get featured templates
 *     responses:
 *       200:
 *         description: List of featured templates
 */
router.get('/featured', security_middleware_1.publicApiRateLimiter, controller.featured);
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
router.get('/:id', security_middleware_1.publicApiRateLimiter, controller.getById);
exports.default = router;
//# sourceMappingURL=template.routes.js.map