"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("@/modules/activity/activity.controller");
const activity_service_1 = require("@/modules/activity/application/activity.service");
const PrismaActivityRepository_1 = require("@/modules/activity/infrastructure/PrismaActivityRepository");
const auth_middleware_1 = require("@/shared/middlewares/auth.middleware");
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaActivityRepository_1.PrismaActivityRepository(database_1.db);
const service = new activity_service_1.ActivityService(repository);
const controller = new activity_controller_1.ActivityController(service);
/**
 * @swagger
 * /api/v1/activities:
 *   get:
 *     summary: Get user activity feed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: User activity feed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', auth_middleware_1.authenticate, controller.getUserActivity);
/**
 * @swagger
 * /api/v1/stats/global:
 *   get:
 *     summary: Get global platform statistics
 *     responses:
 *       200:
 *         description: Global statistics
 */
router.get('/global', security_middleware_1.publicApiRateLimiter, controller.getGlobalStats);
exports.default = router;
//# sourceMappingURL=activity.routes.js.map