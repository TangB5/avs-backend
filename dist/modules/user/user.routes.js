"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("@/modules/user/user.controller");
const user_service_1 = require("@/modules/user/application/user.service");
const PrismaUserRepository_1 = require("@/modules/user/infrastructure/PrismaUserRepository");
const auth_middleware_1 = require("@/shared/middlewares/auth.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaUserRepository_1.PrismaUserRepository(database_1.db);
const service = new user_service_1.UserService(repository);
const controller = new user_controller_1.UserController(service);
/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', auth_middleware_1.authenticate, controller.getMe);
/**
 * @swagger
 * /api/v1/users/me/stats:
 *   get:
 *     summary: Get user statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me/stats', auth_middleware_1.authenticate, controller.getStats);
/**
 * @swagger
 * /api/v1/users/me/patterns:
 *   get:
 *     summary: Get user patterns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           maximum: 50
 *         description: Maximum number of patterns to return
 *     responses:
 *       200:
 *         description: User patterns
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me/patterns', auth_middleware_1.authenticate, controller.getPatterns);
/**
 * @swagger
 * /api/v1/users/me/activity:
 *   get:
 *     summary: Get user activity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 50
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: User activity
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me/activity', auth_middleware_1.authenticate, controller.getActivity);
/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/me', auth_middleware_1.authenticate, controller.update);
/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/me', auth_middleware_1.authenticate, controller.delete);
exports.default = router;
//# sourceMappingURL=user.routes.js.map