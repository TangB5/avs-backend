"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("@/modules/comment/comment.controller");
const comment_service_1 = require("@/modules/comment/application/comment.service");
const PrismaCommentRepository_1 = require("@/modules/comment/infrastructure/PrismaCommentRepository");
const auth_middleware_1 = require("@/shared/middlewares/auth.middleware");
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const database_1 = require("@/config/database");
const router = (0, express_1.Router)();
// Dependency Injection
const repository = new PrismaCommentRepository_1.PrismaCommentRepository(database_1.db);
const service = new comment_service_1.CommentService(repository);
const controller = new comment_controller_1.CommentController(service);
/**
 * @swagger
 * /api/v1/patterns/{patternId}/comments:
 *   get:
 *     summary: Get comments on a pattern
 *     parameters:
 *       - in: path
 *         name: patternId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Comments on pattern
 */
router.get('/patterns/:patternId/comments', security_middleware_1.publicApiRateLimiter, controller.getComments);
/**
 * @swagger
 * /api/v1/artisans/{artisanId}/comments:
 *   get:
 *     summary: Get comments on an artisan
 *     parameters:
 *       - in: path
 *         name: artisanId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Comments on artisan
 */
router.get('/artisans/:artisanId/comments', security_middleware_1.publicApiRateLimiter, controller.getComments);
/**
 * @swagger
 * /api/v1/patterns/{patternId}/comments:
 *   post:
 *     summary: Add comment to a pattern
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patternId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Comment added
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/patterns/:patternId/comments', auth_middleware_1.authenticate, security_middleware_1.publicApiRateLimiter, controller.addComment);
/**
 * @swagger
 * /api/v1/artisans/{artisanId}/comments:
 *   post:
 *     summary: Add comment to an artisan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artisanId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/artisans/:artisanId/comments', auth_middleware_1.authenticate, security_middleware_1.publicApiRateLimiter, controller.addComment);
/**
 * @swagger
 * /api/v1/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Comment deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id', auth_middleware_1.authenticate, controller.deleteComment);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map