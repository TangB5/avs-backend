"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artisan_controller_1 = require("@/modules/artisan/artisan.controller");
const artisan_service_1 = require("@/modules/artisan/application/artisan.service");
const PrismaArtisanRepository_1 = require("@/modules/artisan/infrastructure/PrismaArtisanRepository");
const auth_middleware_1 = require("@/shared/middlewares/auth.middleware");
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaArtisanRepository_1.PrismaArtisanRepository(database_1.db);
const service = new artisan_service_1.ArtisanService(repository);
const controller = new artisan_controller_1.ArtisanController(service);
/**
 * @swagger
 * /api/v1/artisans:
 *   get:
 *     summary: List all artisans
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: specialty
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of artisans
 */
router.get('/', security_middleware_1.publicApiRateLimiter, controller.list);
/**
 * @swagger
 * /api/v1/artisans/{id}:
 *   get:
 *     summary: Get artisan by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Artisan details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', security_middleware_1.publicApiRateLimiter, controller.getById);
/**
 * @swagger
 * /api/v1/artisans:
 *   post:
 *     summary: Create artisan profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, craft, origin, country, bio, specialties]
 *             properties:
 *               name:
 *                 type: string
 *               craft:
 *                 type: string
 *               origin:
 *                 type: string
 *               country:
 *                 type: string
 *               bio:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Artisan created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', auth_middleware_1.authenticate, controller.create);
/**
 * @swagger
 * /api/v1/artisans/{id}:
 *   patch:
 *     summary: Update artisan profile
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
 *         description: Artisan updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/:id', auth_middleware_1.authenticate, controller.update);
/**
 * @swagger
 * /api/v1/artisans/{id}/verify:
 *   patch:
 *     summary: Verify artisan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Artisan verified
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/verify', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, controller.verify);
/**
 * @swagger
 * /api/v1/artisans/{id}:
 *   delete:
 *     summary: Delete artisan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Artisan deleted
 */
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, controller.delete);
exports.default = router;
//# sourceMappingURL=artisan.routes.js.map