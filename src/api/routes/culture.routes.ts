import { Router } from 'express';
import { CultureController } from '../controllers/culture.controller';
import { CultureService }    from '@/modules/culture/application/culture.service';
import { PrismaCultureRepository } from '@/modules/culture/infrastructure/PrismaCultureRepository';
import { authenticate, requireCurator, requireAdmin } from '@/shared/middlewares/auth.middleware';
import { publicApiRateLimiter } from '@/shared/middlewares/security.middleware';
import { db } from '@/config/database';

const router = Router();

// Composition root (Dependency Injection manuelle)
const repository  = new PrismaCultureRepository(db);
const service     = new CultureService(repository);
const controller  = new CultureController(service);

/**
 * @swagger
 * /api/v1/patterns:
 *   get:
 *     summary: Lister les motifs culturels africains
 *     description: >
 *       Retourne la liste paginée des motifs (Ndop, Adinkra, Kente, Bogolan, Wax…).
 *       Sans authentification, seuls les motifs publiés sont retournés.
 *     tags: [Patterns]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, maximum: 100 }
 *         description: Éléments par page
 *       - in: query
 *         name: region
 *         schema: { $ref: '#/components/schemas/Region' }
 *         description: Filtrer par région africaine
 *       - in: query
 *         name: patternType
 *         schema: { $ref: '#/components/schemas/PatternType' }
 *         description: Filtrer par type de motif
 *       - in: query
 *         name: search
 *         schema: { type: string, maxLength: 128 }
 *         description: Recherche full-text (nom, mots-clés symboliques)
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/CulturePattern' }
 *             example:
 *               success: true
 *               message: OK
 *               data:
 *                 - id: clx4f2k3d0000v9rg8h1m2n3p
 *                   slug: ndop-bamoum
 *                   nameFr: Ndop Royal Bamoum
 *                   patternType: ndop
 *                   region: central-africa
 *                   country: CM
 *                   colors: { primary: '#C0573E', secondary: '#F5EBE0', accent: '#1D1D1B' }
 *                   isPublished: true
 *                   viewCount: 247
 *               meta: { page: 1, perPage: 20, totalItems: 42, totalPages: 3 }
 *       429:
 *         description: Trop de requêtes (rate limit)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', publicApiRateLimiter, controller.list);

/**
 * @swagger
 * /api/v1/patterns/{slug}:
 *   get:
 *     summary: Récupérer un motif par son slug
 *     description: >
 *       Retourne les détails complets d'un motif culturel.
 *       Incrémente automatiquement le compteur de vues (`viewCount`).
 *     tags: [Patterns]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, example: ndop-bamoum }
 *         description: Identifiant URL du motif (slug)
 *     responses:
 *       200:
 *         description: Motif trouvé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CulturePattern' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:slug', publicApiRateLimiter, controller.getBySlug);

/**
 * @swagger
 * /api/v1/patterns:
 *   post:
 *     summary: Créer un nouveau motif culturel
 *     description: >
 *       Crée un motif en statut **non publié**. La publication nécessite
 *       une action séparée par un curateur ou un admin.
 *     tags: [Patterns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreatePatternDto' }
 *           example:
 *             nameFr: Adinkra Sankofa
 *             nameEn: Sankofa Adinkra
 *             descFr: Symbole Akan signifiant « apprendre du passé pour construire l'avenir ».
 *             descEn: Akan symbol meaning « learn from the past to build the future ».
 *             patternType: adinkra
 *             region: west-africa
 *             country: GH
 *             colors: { primary: '#C0573E', secondary: '#F5EBE0', accent: '#1D1D1B' }
 *             symbolism:
 *               meaning: Résilience, mémoire ancestrale, retour aux sources
 *               keywords: [sankofa, akan, ghana, résilience]
 *               usage: universal
 *     responses:
 *       201:
 *         description: Motif créé (en attente de publication)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CulturePattern' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Un motif avec ce slug existe déjà
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', authenticate, controller.create);

/**
 * @swagger
 * /api/v1/patterns/{id}/publish:
 *   patch:
 *     summary: Publier un motif culturel
 *     description: Rend le motif visible publiquement. Requiert le rôle **curator** ou **admin**.
 *     tags: [Patterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du motif à publier
 *     responses:
 *       200:
 *         description: Motif publié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CulturePattern' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/publish', authenticate, requireCurator, controller.publish);

/**
 * @swagger
 * /api/v1/patterns/{id}:
 *   delete:
 *     summary: Supprimer un motif culturel
 *     description: Suppression définitive. Requiert le rôle **admin**.
 *     tags: [Patterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du motif à supprimer
 *     responses:
 *       204:
 *         description: Motif supprimé (aucun contenu retourné)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authenticate, requireAdmin, controller.remove);

export default router;
