# Documentation Technique - AVS Backend

## 📋 Table des matières

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Structure du Projet](#structure-du-projet)
4. [Technologies](#technologies)
5. [Configuration](#configuration)
6. [Base de Données](#base-de-données)
7. [API Endpoints](#api-endpoints)
8. [Modules](#modules)
9. [Infrastructure](#infrastructure)
10. [Sécurité](#sécurité)
11. [Déploiement](#déploiement)
12. [Développement](#développement)

---

## Overview

**AVS Backend** est une API RESTful pour l'African Visual Standard, construite avec Express.js et TypeScript suivant les principes de Clean Architecture. Cette API gère les motifs culturels africains, les artisans, les palettes de couleurs, les templates et les interactions communautaires.

**Version**: 1.0.0  
**Node.js**: >=18.0.0  
**Langage**: TypeScript 5.9.3

---

## Architecture

### Clean Architecture

Le projet suit une architecture en couches avec séparation des préoccupations :

```
src/
├── api/              # Couche API (Controllers, Routes)
├── modules/          # Domain Logic (Application, Domain, Infrastructure)
├── infrastructure/   # Services externes (Storage, Database, Cache)
├── shared/           # Utilitaires partagés (Utils, Middlewares, Errors)
├── config/           # Configuration de l'application
└── app.ts           # Point d'entrée Express
```

### Principes Architecturaux

- **Dependency Injection**: Injection via constructeur (Inversion of Control)
- **Interface Segregation**: Utilisation d'interfaces pour les repositories
- **Single Responsibility**: Chaque classe a une responsabilité unique
- **Open/Closed**: Ouvert à l'extension, fermé à la modification

---

## Structure du Projet

### Détail des Dossiers

#### `/src/api/`
- **controllers/** : Contrôleurs HTTP (CultureController)
- **routes/** : Définition des routes Express (culture.routes)

#### `/src/modules/`
Chaque module suit la structure DDD (Domain-Driven Design) :

```
module/
├── application/      # Cas d'usage (Services)
├── domain/          # Entités et Interfaces du domaine
└── infrastructure/  # Implémentation des repositories (Prisma)
```

**Modules disponibles** :
- `culture` : Gestion des motifs culturels (Patterns)
- `auth` : Authentification et sessions
- `user` : Gestion des utilisateurs
- `artisan` : Profils d'artisans
- `palette` : Palettes de couleurs africaines
- `template` : Templates UI/UX
- `comment` : Système de commentaires
- `activity` : Journal d'activités

#### `/src/infrastructure/`
- **storage/** : Services de stockage de fichiers (Supabase, Cloudinary, AWS S3)
- **database/** : Configuration Prisma
- **cache/** : Cache Redis (à implémenter)
- **messaging/** : Services de messagerie (à implémenter)

#### `/src/shared/`
- **utils/** : Utilitaires (logger, pagination)
- **middlewares/** : Middlewares Express (auth, security)
- **errors/** : Gestion des erreurs personnalisées
- **types/** : Types TypeScript partagés
- **filters/** : Filtres d'erreurs globaux
- **docs/** : Configuration Swagger

---

## Technologies

### Core
- **Express.js 5.2.1** : Framework web
- **TypeScript 5.9.3** : Typage statique
- **Node.js >=18.0.0** : Runtime

### Base de Données
- **Prisma 5.22.0** : ORM
- **PostgreSQL** : Base de données relationnelle
- **@prisma/adapter-pg** : Adaptateur PostgreSQL

### Authentification
- **jsonwebtoken 9.0.3** : JWT tokens
- **bcryptjs 3.0.3** : Hashage de mots de passe
- **cookie-parser 1.4.7** : Gestion des cookies

### Stockage
- **@supabase/supabase-js 2.104.1** : Supabase Storage
- **cloudinary 2.9.0** : Cloudinary CDN
- **@aws-sdk/client-s3 3.1037.0** : AWS S3
- **multer 2.1.1** : Upload de fichiers

### Sécurité
- **helmet 8.1.0** : Headers HTTP sécurisés
- **cors 2.8.6** : Gestion CORS
- **express-rate-limit 8.3.1** : Rate limiting
- **express-validator 7.3.1** : Validation des données

### Validation & Schémas
- **zod 4.3.6** : Validation de schémas

### Logging
- **winston 3.19.0** : Logging structuré
- **morgan 1.10.1** : Logging HTTP

### Documentation
- **swagger-jsdoc 6.2.8** : Génération Swagger
- **swagger-ui-express 5.0.1** : Interface Swagger UI

### Testing
- **jest 30.3.0** : Framework de tests
- **supertest 7.2.2** : Tests API HTTP

### Développement
- **tsx 4.21.0** : Exécution TypeScript
- **eslint 10.1.0** : Linting
- **prettier 3.8.1** : Formatting

---

## Configuration

### Variables d'Environnement

#### Application
```env
NODE_ENV=development
PORT=4000
API_VERSION=v1
APP_NAME="AVS Backend API"
```

#### Base de Données
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### JWT
```env
JWT_SECRET=GENERATE_WITH_openssl_rand_base64_64
JWT_REFRESH_SECRET=GENERATE_WITH_openssl_rand_base64_64
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### CORS
```env
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://avs-standard.com
```

#### Stockage
```env
STORAGE_PROVIDER=local  # local | s3 | gcs
STORAGE_BUCKET=avs-assets

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AWS S3 (optionnel)
AWS_BUCKET=your-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### Monitoring
```env
SENTRY_DSN=https://your-dsn@sentry.io/0
LOG_LEVEL=debug
```

---

## Base de Données

### Schéma Prisma

#### Modèles Principaux

**User**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  role          Role      @default(VIEWER)
  emailVerified DateTime?
  bio           String?   @db.Text
  location      String?
  avatar        String?
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  patterns      Pattern[]
  artisan       Artisan?
  comments      Comment[]
  activities    Activity[]
}
```

**Pattern** (Motif Culturel)
```prisma
model Pattern {
  id               String      @id @default(cuid())
  slug             String      @unique
  nameFr           String
  nameEn           String
  descFr           String      @db.Text
  descEn           String      @db.Text
  patternType      PatternType
  region           Region
  country          String      @db.Char(2)
  colorPrimary     String
  colorSecondary   String
  colorAccent      String?
  symbolMeaning    String      @db.Text
  symbolKeywords   String[]
  symbolUsage      UsageType
  isPublished      Boolean     @default(false)
  isFeatured       Boolean     @default(false)
  viewCount        Int         @default(0)
  downloadCount    Int         @default(0)
  svgUrl           String?
  previewUrl       String?
  createdById      String
  createdBy        User        @relation(fields: [createdById], references: [id])
  comments         Comment[]
}
```

**Artisan**
```prisma
model Artisan {
  id            String               @id @default(cuid())
  userId        String               @unique
  name          String
  craft         String
  origin        String
  country       String
  bio           String               @db.Text
  specialties   ArtisanSpecialty[]
  patternCount  Int                  @default(0)
  rating        Float                @default(0)
  verified      Boolean              @default(false)
  user          User                 @relation(fields: [userId], references: [id])
  comments      Comment[]
}
```

#### Enums

**Role**
- VIEWER
- CONTRIBUTOR
- CURATOR
- ADMIN

**PatternType**
- KENTE
- BOGOLAN
- ADINKRA
- NDEBELE
- KUBA
- NDOP
- WAX

**Region**
- WEST_AFRICA
- EAST_AFRICA
- CENTRAL_AFRICA
- NORTH_AFRICA
- SOUTH_AFRICA
- DIASPORA

### Migrations

```bash
# Créer une migration
npm run migrate

# Pousser le schéma (dev)
npm run db:push

# Générer le client Prisma
npm run db:generate

# Ouvrir Prisma Studio
npm run db:studio

# Seeding
npm run db:seed
```

---

## API Endpoints

### Base URL
```
http://localhost:4000/api/v1
```

### Health Check
```
GET /api/v1/health
```

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### Users
```
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Patterns (Motifs Culturels)
```
GET    /api/v1/patterns
POST   /api/v1/patterns
GET    /api/v1/patterns/:slug
PATCH  /api/v1/patterns/:slug
DELETE /api/v1/patterns/:slug
PATCH  /api/v1/patterns/:slug/publish
```

### Artisans
```
GET    /api/v1/artisans
POST   /api/v1/artisans
GET    /api/v1/artisans/:id
PATCH  /api/v1/artisans/:id
DELETE /api/v1/artisans/:id
```

### Palettes
```
GET    /api/v1/palettes
POST   /api/v1/palettes
GET    /api/v1/palettes/:id
PATCH  /api/v1/palettes/:id
DELETE /api/v1/palettes/:id
```

### Templates
```
GET    /api/v1/templates
POST   /api/v1/templates
GET    /api/v1/templates/:id
PATCH  /api/v1/templates/:id
DELETE /api/v1/templates/:id
```

### Comments
```
GET    /api/v1/comments
POST   /api/v1/comments
GET    /api/v1/comments/:id
PATCH  /api/v1/comments/:id
DELETE /api/v1/comments/:id
```

### Activities
```
GET    /api/v1/activities
```

### Documentation
```
GET /api-docs          # Swagger UI
GET /api-docs.json     # Swagger JSON
```

---

## Modules

### Culture Module

Gestion des motifs culturels africains avec upload de fichiers SVG et images.

#### Structure
```
modules/culture/
├── application/
│   └── culture.service.ts      # Cas d'usage
├── domain/
│   ├── CulturePattern.ts       # Entité du domaine
│   └── ICultureRepository.ts   # Interface repository
└── infrastructure/
    └── PrismaCultureRepository.ts # Implémentation Prisma
```

#### Fonctionnalités
- CRUD des motifs culturels
- Upload SVG (via Multer)
- Upload d'images de symboles (jusqu'à 20)
- Validation avec Zod
- Gestion des permissions (créateur, admin)
- Publication des motifs (curator/admin)

#### Controller
```typescript
class CultureController {
  create()      // POST /patterns
  getAll()      // GET /patterns
  getBySlug()   // GET /patterns/:slug
  update()      // PATCH /patterns/:slug
  delete()      // DELETE /patterns/:slug
  publish()     // PATCH /patterns/:slug/publish
}
```

### Auth Module

Authentification JWT avec support cookies et headers.

#### Fonctionnalités
- Inscription utilisateur
- Connexion avec JWT
- Refresh tokens
- Logout
- Support cookies httpOnly (priorité)
- Support Authorization Bearer header (fallback)

#### Middleware
```typescript
authenticate          // Vérifie le JWT
requireRole(...)      // Vérifie les rôles
requireCurator        // Rôle curator ou admin
requireAdmin          // Rôle admin uniquement
```

### User Module

Gestion des profils utilisateurs.

#### Fonctionnalités
- CRUD utilisateurs
- Gestion des rôles
- Profile utilisateur

---

## Infrastructure

### Storage Service

Architecture multi-provider avec fallback automatique.

#### Interface
```typescript
interface IStorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}

interface UploadResult {
  url: string;
  key: string;
  provider: string;
}
```

#### Providers
1. **SupabaseProvider** (priorité)
   - Bucket: `patterns`
   - Support folders: `patterns/`, `symbols/`
   - Logging détaillé

2. **CloudinaryProvider**
   - Cloud-based CDN
   - Transformation automatique

3. **AwsProvider**
   - AWS S3
   - Haute disponibilité

#### Factory Pattern
```typescript
export function createStorageService() {
  const providers = [];
  
  if (process.env.SUPABASE_URL) {
    providers.push(new SupabaseProvider());
  }
  
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    providers.push(new CloudinaryProvider());
  }
  
  if (process.env.AWS_BUCKET) {
    providers.push(new AwsProvider());
  }
  
  return new StorageService(providers);
}
```

### Database

Configuration Prisma avec PostgreSQL.

```typescript
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

export async function connectDatabase() {
  await db.$connect();
}

export async function disconnectDatabase() {
  await db.$disconnect();
}
```

---

## Sécurité

### Middlewares de Sécurité

#### Helmet
Headers HTTP sécurisés :
- Content Security Policy
- HSTS
- X-Frame-Options
- X-XSS-Protection

#### CORS
Origines autorisées configurées via `ALLOWED_ORIGINS`.

#### Rate Limiting
- **Global**: 200 requêtes / 15 minutes
- **Auth**: 10 requêtes / 15 minutes
- **Public API**: 60 requêtes / 1 minute

#### Request ID
Génération d'ID unique pour chaque requête (X-Request-ID).

### Authentification

#### JWT
- Access token: 15 minutes
- Refresh token: 7 jours
- Support cookie httpOnly (priorité)
- Support Authorization Bearer header (fallback)

#### Rôles
- **VIEWER**: Lecture seule
- **CONTRIBUTOR**: Création de contenu
- **CURATOR**: Publication et modération
- **ADMIN**: Accès complet

---

## Déploiement

### Docker

#### Dockerfile
Multi-stage build optimisé pour la production.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production=false
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S avs && adduser -S avs -G avs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
USER avs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1
CMD ["node", "dist/server.js"]
```

#### Docker Compose
```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f api

# Arrêter les services
docker-compose down
```

### Environment Variables

Assurez-vous de configurer toutes les variables d'environnement requises avant le déploiement.

---

## Développement

### Scripts NPM

```bash
# Développement
npm run dev              # Mode watch avec tsx

# Build
npm run build            # Compilation TypeScript
npm run start            # Production

# Linting
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique
npm run type-check       # Vérification des types

# Tests
npm run test             # Tests avec coverage
npm run test:watch       # Mode watch

# Base de données
npm run migrate          # Créer migration
npm run db:push          # Pousser schéma (dev)
npm run db:generate      # Générer client Prisma
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Seeding

# Docker
npm run docker:up        # Démarrer containers
npm run docker:down      # Arrêter containers
npm run docker:logs      # Voir logs
```

### Logger

Utilisation de Winston pour le logging structuré.

```typescript
import { logger } from '@/shared/utils/logger';

logger.info('Message informatif');
logger.warn('Message d\'avertissement');
logger.error('Message d\'erreur');
logger.http('Requête HTTP');
```

### Pagination

Utilitaire de pagination standardisé.

```typescript
import { parsePagination, buildMeta } from '@/shared/utils/pagination';

const { page, perPage, skip } = parsePagination(query);
const meta = buildMeta(totalItems, page, perPage);
```

### Erreurs

Gestion des erreurs personnalisées.

```typescript
import { NotFoundError, ConflictError, ForbiddenError, UnauthorizedError } from '@/shared/errors/AppError';

throw new NotFoundError('Ressource non trouvée');
throw new ConflictError('Conflit de données');
throw new ForbiddenError('Accès refusé');
throw new UnauthorizedError('Non authentifié');
```

---

## Documentation API

### Swagger UI

L'API est documentée avec Swagger/OpenAPI 3.0.

- **URL**: http://localhost:4000/api-docs
- **JSON**: http://localhost:4000/api-docs.json

### Configuration Swagger

```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AVS Backend API',
      version: '1.0.0',
      description: 'API pour l\'African Visual Standard',
    },
    servers: [
      { url: 'http://localhost:4000/api/v1' },
    ],
  },
  apis: ['./src/**/*.ts'],
});
```

---

## Monitoring

### Logs

Les logs sont stockés dans le dossier `logs/` en production :
- `error.log`: Erreurs uniquement
- `combined.log`: Tous les logs

### Health Check

Endpoint de santé pour monitoring :

```bash
curl http://localhost:4000/api/v1/health
```

Réponse :
```json
{
  "status": "ok",
  "service": "avs-backend",
  "version": "1.0.0",
  "timestamp": "2026-05-16T20:00:00.000Z",
  "uptime": 3600.42
}
```

---

## Bonnes Pratiques

### Code Style

- **ESLint**: Configuration stricte avec TypeScript
- **Prettier**: Formatting automatique
- **TypeScript**: Strict mode activé

### Git

- Commits conventionnels
- Branches feature/
- Pull requests requises

### Tests

- Tests unitaires avec Jest
- Tests d'intégration avec Supertest
- Coverage minimum: 80%

---

## Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Document généré le 16 mai 2026**
