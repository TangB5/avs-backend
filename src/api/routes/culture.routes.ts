import { Router } from 'express';
import { CultureController, uploadSvg } from '../controllers/culture.controller';
import { CultureService }    from '@/modules/culture/application/culture.service';
import { PrismaCultureRepository } from '@/modules/culture/infrastructure/PrismaCultureRepository';
import { authenticate, requireCurator, requireAdmin } from '@/shared/middlewares/auth.middleware';
import { publicApiRateLimiter, authRateLimiter } from '@/shared/middlewares/security.middleware';
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
 *       Avec authentification, les utilisateurs peuvent voir leurs propres brouillons.
 *       Les motifs retournés incluent toutes les informations du formulaire 3 étapes.
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
 *     summary: Obtenir un motif par son slug
 *     description: >
 *       Retourne les détails complets d'un motif culturel.
 *       Incrémente automatiquement le compteur de vues.
 *       Les détails incluent toutes les informations du formulaire 3 étapes:
 *       - Identité complète (noms, localisation, peuple, royaume)
 *       - Description détaillée (histoire, technique, symbolisme)
 *       - Couleurs et assets (palette complète, symboles, sources)
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
 *       Le formulaire correspond au wizard en 3 étapes du frontend:
 *       - Étape 1: Identité (noms, type, localisation)
 *       - Étape 2: Description (contexte, symbolisme, usage)
 *       - Étape 3: Couleurs & Assets (palette, fichier SVG, symboles)
 *     tags: [Patterns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               # Step 1: Identity
 *               nameFr:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom français
 *                 example: Ndop Royal Bamoum
 *               nameLocal:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom langue locale
 *                 example: Ndop (Ndoup)
 *               nameEn:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom anglais
 *                 example: Bamoum Royal Ndop
 *               patternType:
 *                 type: string
 *                 enum: ['kente', 'bogolan', 'adinkra', 'ndebele', 'ndop', 'wax', 'kuba']
 *                 example: ndop
 *               region:
 *                 type: string
 *                 enum: ['west-africa', 'east-africa', 'central-africa', 'north-africa', 'south-africa', 'diaspora']
 *                 example: central-africa
 *               country:
 *                 type: string
 *                 length: 2
 *                 description: Code pays ISO 2 lettres
 *                 example: CM
 *               people:
 *                 type: string
 *                 maxLength: 128
 *                 description: Peuple/groupe ethnique
 *                 example: Peuple Bamoum (Bamum)
 *               flag:
 *                 type: string
 *                 maxLength: 8
 *                 description: Emoji drapeau
 *                 example: 🇨🇲
 *               coords:
 *                 type: string
 *                 description: Tableau JSON [latitude, longitude]
 *                 example: "[6.6885, -1.6244]"
 *               kingdom:
 *                 type: string
 *                 maxLength: 128
 *                 description: Royaume ou empire
 *                 example: Sultanat Bamoum
 *               era:
 *                 type: string
 *                 maxLength: 64
 *                 description: Période historique
 *                 example: XVIIe siècle — présent
 *               license:
 *                 type: string
 *                 enum: ['cc0', 'cc-by', 'cc-by-sa']
 *                 default: cc-by
 *               
 *               # Step 2: Description
 *               summary:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Résumé pour listes et aperçus
 *                 example: Ndop royal traditionnel du peuple Bamoum
 *               descFr:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 description: Description française
 *                 example: Le Ndop est un tissu traditionnel...
 *               descEn:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 description: Description anglaise
 *                 example: The Ndop is a traditional fabric...
 *               history:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Contexte historique
 *                 example: Originaire du XVIIe siècle sous le règne du Sultan Njoya...
 *               technique:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Technique de fabrication
 *                 example: Tissage sur métier traditionnel avec fils de coton teints naturellement
 *               symbolMeaning:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 512
 *                 description: Signification symbolique
 *                 example: Représente l'autorité royale et la connexion avec les ancêtres
 *               ceremonial:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Usage cérémoniel
 *                 example: Porté lors des cérémonies d'intronisation et des rituels royaux
 *               symbolUsage:
 *                 type: string
 *                 enum: ['ceremonial', 'daily', 'royal', 'spiritual', 'universal']
 *                 example: ceremonial
 *               symbolKeywords:
 *                 type: string
 *                 description: Tableau JSON de mots-clés
 *                 example: '["royauté", "spiritualité", "bamoum", "tradition"]'
 *               
 *               # Step 3: Colors & Assets
 *               colors:
 *                 type: string
 *                 description: Tableau JSON d'objets couleurs avec hex, name, meaning
 *                 example: '[{"hex": "#C0573E", "name": "Rouleur", "meaning": "Force et pouvoir"}, {"hex": "#F5EBE0", "name": "Paix", "meaning": "Harmonie et sérénité"}]'
 *               svgPattern:
 *                 type: string
 *                 description: Nom de classe CSS pour le motif
 *                 example: avs-pattern-ndop-sultan
 *               artisanQuote:
 *                 type: string
 *                 description: Objet JSON avec citation artisan (optionnel)
 *                 example: '{"text": "Chaque fil raconte une histoire, chaque motif porte une âme.", "author": "Foumban", "role": "Maître tisserand", "country": "Cameroun"}'
 *               sources:
 *                 type: string
 *                 description: Tableau JSON de sources de référence
 *                 example: '["Archives du palais de Foumban", "Recherches anthropologiques sur les tissus bamoum"]'
 *               symbols:
 *                 type: string
 *                 description: Tableau JSON de symboles constituants avec name, meaning, usage
 *                 example: '[{"name": "Sankofa", "nameFr": "Sankofa", "cssPreview": "#pattern-sankofa", "meaning": "Retour aux sources", "usage": "spirituel", "sacred": false}]'
 *               
 *               # File upload
 *               svgFile:
 *                 type: string
 *                 format: binary
 *                 description: Fichier SVG du motif (max 2MB, SVG uniquement)
 *             required:
 *               - nameFr
 *               - nameLocal
 *               - nameEn
 *               - patternType
 *               - region
 *               - country
 *               - summary
 *               - descFr
 *               - descEn
 *               - history
 *               - technique
 *               - symbolMeaning
 *               - ceremonial
 *               - symbolUsage
 *               - symbolKeywords
 *               - colors
 *               - sources
 *               - symbols
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
router.post('/', authenticate, authRateLimiter, uploadSvg.single('svgFile'), controller.create);

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
/**
 * @swagger
 * /api/v1/patterns/{id}:
 *   patch:
 *     summary: Mettre à jour un motif culturel
 *     description: >
 *       Met à jour un motif existant. Seul le créateur ou un admin peut modifier.
 *       Supporte les mêmes champs que la création (tous optionnels).
 *       Le formulaire correspond au wizard en 3 étapes du frontend.
 *     tags: [Patterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du motif à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               # Step 1: Identity (optional)
 *               nameFr:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom français
 *                 example: Ndop Royal Bamoum
 *               nameLocal:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom langue locale
 *                 example: Ndop (Ndoup)
 *               nameEn:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 128
 *                 description: Nom anglais
 *                 example: Bamoum Royal Ndop
 *               patternType:
 *                 type: string
 *                 enum: ['kente', 'bogolan', 'adinkra', 'ndebele', 'ndop', 'wax', 'kuba']
 *                 example: ndop
 *               region:
 *                 type: string
 *                 enum: ['west-africa', 'east-africa', 'central-africa', 'north-africa', 'south-africa', 'diaspora']
 *                 example: central-africa
 *               country:
 *                 type: string
 *                 length: 2
 *                 description: Code pays ISO 2 lettres
 *                 example: CM
 *               people:
 *                 type: string
 *                 maxLength: 128
 *                 description: Peuple/groupe ethnique
 *                 example: Peuple Bamoum (Bamum)
 *               flag:
 *                 type: string
 *                 maxLength: 8
 *                 description: Emoji drapeau
 *                 example: 🇨🇲
 *               coords:
 *                 type: string
 *                 description: Tableau JSON [latitude, longitude]
 *                 example: "[6.6885, -1.6244]"
 *               kingdom:
 *                 type: string
 *                 maxLength: 128
 *                 description: Royaume ou empire
 *                 example: Sultanat Bamoum
 *               era:
 *                 type: string
 *                 maxLength: 64
 *                 description: Période historique
 *                 example: XVIIe siècle — présent
 *               license:
 *                 type: string
 *                 enum: ['cc0', 'cc-by', 'cc-by-sa']
 *                 default: cc-by
 *               
 *               # Step 2: Description (optional)
 *               summary:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Résumé pour listes et aperçus
 *                 example: Ndop royal traditionnel du peuple Bamoum
 *               descFr:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 description: Description française
 *                 example: Le Ndop est un tissu traditionnel...
 *               descEn:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 description: Description anglaise
 *                 example: The Ndop is a traditional fabric...
 *               history:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Contexte historique
 *                 example: Originaire du XVIIe siècle sous le règne du Sultan Njoya...
 *               technique:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Technique de fabrication
 *                 example: Tissage sur métier traditionnel avec fils de coton teints naturellement
 *               symbolMeaning:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 512
 *                 description: Signification symbolique
 *                 example: Représente l'autorité royale et la connexion avec les ancêtres
 *               ceremonial:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Usage cérémoniel
 *                 example: Porté lors des cérémonies d'intronisation et des rituels royaux
 *               symbolUsage:
 *                 type: string
 *                 enum: ['ceremonial', 'daily', 'royal', 'spiritual', 'universal']
 *                 example: ceremonial
 *               symbolKeywords:
 *                 type: string
 *                 description: Tableau JSON de mots-clés
 *                 example: '["royauté", "spiritualité", "bamoum", "tradition"]'
 *               
 *               # Step 3: Colors & Assets (optional)
 *               colors:
 *                 type: string
 *                 description: Tableau JSON d'objets couleurs avec hex, name, meaning
 *                 example: '[{"hex": "#C0573E", "name": "Rouleur", "meaning": "Force et pouvoir"}, {"hex": "#F5EBE0", "name": "Paix", "meaning": "Harmonie et sérénité"}]'
 *               svgPattern:
 *                 type: string
 *                 description: Nom de classe CSS pour le motif
 *                 example: avs-pattern-ndop-sultan
 *               artisanQuote:
 *                 type: string
 *                 description: Objet JSON avec citation artisan (optionnel)
 *                 example: '{"text": "Chaque fil raconte une histoire, chaque motif porte une âme.", "author": "Foumban", "role": "Maître tisserand", "country": "Cameroun"}'
 *               sources:
 *                 type: string
 *                 description: Tableau JSON de sources de référence
 *                 example: '["Archives du palais de Foumban", "Recherches anthropologiques sur les tissus bamoum"]'
 *               symbols:
 *                 type: string
 *                 description: Tableau JSON de symboles constituants avec name, meaning, usage
 *                 example: '[{"name": "Sankofa", "nameFr": "Sankofa", "cssPreview": "#pattern-sankofa", "meaning": "Retour aux sources", "usage": "spirituel", "sacred": false}]'
 *               
 *               # File upload (optional)
 *               svgFile:
 *                 type: string
 *                 format: binary
 *                 description: Fichier SVG du motif (max 2MB, SVG uniquement)
 *     responses:
 *       200:
 *         description: Motif mis à jour avec succès
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
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch('/:id', authenticate, authRateLimiter, uploadSvg.single('svgFile'), controller.update);

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
