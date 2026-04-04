"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const palette_controller_1 = require("@/modules/palette/palette.controller");
const palette_service_1 = require("@/modules/palette/application/palette.service");
const PrismaPaletteRepository_1 = require("@/modules/palette/infrastructure/PrismaPaletteRepository");
const auth_middleware_1 = require("@/shared/middlewares/auth.middleware");
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaPaletteRepository_1.PrismaPaletteRepository(database_1.db);
const service = new palette_service_1.PaletteService(repository);
const controller = new palette_controller_1.PaletteController(service);
/**
 * @swagger
 * /api/v1/palettes:
 *   get:
 *     summary: List all published palettes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: List of palettes
 */
router.get('/', security_middleware_1.publicApiRateLimiter, controller.list);
/**
 * @swagger
 * /api/v1/palettes/{id}:
 *   get:
 *     summary: Get palette by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Palette details with color tokens
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', security_middleware_1.publicApiRateLimiter, controller.getById);
/**
 * @swagger
 * /api/v1/palettes:
 *   post:
 *     summary: Create new palette
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, origin, description, tokens]
 *             properties:
 *               name:
 *                 type: string
 *               origin:
 *                 type: string
 *               description:
 *                 type: string
 *               patternCSS:
 *                 type: string
 *               tokens:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Palette created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', auth_middleware_1.authenticate, controller.create);
/**
 * @swagger
 * /api/v1/palettes/{id}:
 *   patch:
 *     summary: Update palette
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Palette updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/:id', auth_middleware_1.authenticate, controller.update);
/**
 * @swagger
 * /api/v1/palettes/{id}/publish:
 *   patch:
 *     summary: Publish palette
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Palette published
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/publish', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, controller.publish);
/**
 * @swagger
 * /api/v1/palettes/{id}:
 *   delete:
 *     summary: Delete palette
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Palette deleted
 */
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, controller.delete);
exports.default = router;
//# sourceMappingURL=palette.routes.js.map