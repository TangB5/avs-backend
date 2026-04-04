import { Router } from 'express';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/application/user.service';
import { PrismaUserRepository } from '@/modules/user/infrastructure/PrismaUserRepository';
import { authenticate } from '@/shared/middlewares/auth.middleware';
import { db } from '@/config/database';

const router = Router();

// Dependency Injection
const repository = new PrismaUserRepository(db);
const service = new UserService(repository as any);
const controller = new UserController(service);

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
router.get('/me', authenticate, controller.getMe);

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
router.get('/me/stats', authenticate, controller.getStats);

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
router.get('/me/patterns', authenticate, controller.getPatterns);

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
router.get('/me/activity', authenticate, controller.getActivity);

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
router.patch('/me', authenticate, controller.update);

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
router.delete('/me', authenticate, controller.delete);

export default router;
