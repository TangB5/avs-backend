# Guide : Ajouter un nouveau module en Clean Architecture

Ce guide explique comment créer un nouveau module dans le backend AVS en respectant les principes de **Clean Architecture** et la structure existante.

## 📁 Structure générale

Chaque module doit suivre cette structure :

```
src/modules/{nom-module}/
├── application/          # Cas d'usage (Business Logic)
│   └── {module}.service.ts
├── domain/              # Logique métier pure (Entities, Value Objects)
│   ├── {Entity}.ts
│   ├── I{Module}Repository.ts   # Interface (Abstraction)
│   └── {DomainErrors}.ts        # Erreurs métier
├── infrastructure/      # Implémentation technique (BDD, APIs, etc)
│   └── Prisma{Module}Repository.ts
├── dto/                 # Data Transfer Objects (Mappers, Responses)
│   ├── {Module}Request.dto.ts
│   ├── {Module}Response.dto.ts
│   └── {Module}Mapper.ts
├── {module}.controller.ts        # Route handlers (Express)
└── {module}.routes.ts            # Route definitions (Express Router)
```

## 🏗️ Étape 1 : Définir l'entité domaine

**Fichier:** `src/modules/{nom-module}/domain/{Entity}.ts`

L'entité doit être **indépendante de toute infrastructure** (pas de Prisma, Express, etc).

```typescript
// === Entity (Domain Model) ===
export interface {Entity}Props {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export class {Entity} {
  private constructor(private readonly props: {Entity}Props) {}

  // Factory method pour créer une entité valide
  static create(props: {Entity}Props): {Entity} {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Le nom est requis');
    }
    return new {Entity}(props);
  }

  // Accesseurs (immutabilité)
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get createdAt(): Date { return this.props.createdAt; }
  get createdById(): string { return this.props.createdById; }

  // Comportements métier
  updateName(newName: string): {Entity} {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Le nouveau nom est invalide');
    }
    return new {Entity}({ 
      ...this.props, 
      name: newName, 
      updatedAt: new Date() 
    });
  }

  // Sérialisation
  toObject(): {Entity}Props {
    return { ...this.props };
  }
}
```

**Points clés:**
- ✅ Classe `readonly` (immutabilité)
- ✅ Constructeur `private` (forcer `create()`)
- ✅ Validation dans la factory
- ✅ Comportements métier comme méthodes
- ✅ Pas de dépendances externes

---

## 🔌 Étape 2 : Créer l'interface Repository

**Fichier:** `src/modules/{nom-module}/domain/I{Module}Repository.ts`

C'est un **contrat** que l'infrastructure devra implémenter.

```typescript
import type { {Entity} } from './{Entity}';

export interface FindOptions {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FindResult<T> {
  items: T[];
  totalItems: number;
}

export interface I{Module}Repository {
  findById(id: string): Promise<{Entity} | null>;
  findMany(options: FindOptions): Promise<FindResult<{Entity}>>;
  save(entity: {Entity}): Promise<{Entity}>;
  update(entity: {Entity}): Promise<{Entity}>;
  delete(id: string): Promise<void>;
  exists(name: string): Promise<boolean>;
}
```

**Points clés:**
- ✅ Interface pure (pas d'implémentation)
- ✅ Méthodes retournent des entités **domaine**
- ✅ Pas de Prisma, Express, ou détails techniques
- ✅ Types génériques pour flexibilité

---

## 🎯 Étape 3 : Créer le Service (Orchestration)

**Fichier:** `src/modules/{nom-module}/application/{Module}.service.ts`

Le service orchestre les cas d'usage métier via le repository.

```typescript
import { {Entity} } from '../domain/{Entity}';
import type { I{Module}Repository } from '../domain/I{Module}Repository';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';

export interface Create{Entity}Dto {
  name: string;
  // autres champs...
}

export interface Update{Entity}Dto extends Partial<Create{Entity}Dto> {}

export class {Module}Service {
  constructor(private readonly repository: I{Module}Repository) {}

  // Cas d'usage : lister
  async list(page: number = 1, perPage: number = 20) {
    return this.repository.findMany({ page, perPage });
  }

  // Cas d'usage : récupérer un
  async getById(id: string): Promise<{Entity}> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`{Entity} #${id}`);
    }
    return entity;
  }

  // Cas d'usage : créer
  async create(dto: Create{Entity}Dto, userId: string): Promise<{Entity}> {
    const entity = {Entity}.create({
      id: randomUUID(),
      name: dto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: userId,
    });

    return this.repository.save(entity);
  }

  // Cas d'usage : mettre à jour
  async update(id: string, dto: Update{Entity}Dto): Promise<{Entity}> {
    const entity = await this.getById(id);
    
    if (dto.name) {
      return this.repository.update(entity.updateName(dto.name));
    }
    return entity;
  }

  // Cas d'usage : supprimer
  async delete(id: string): Promise<void> {
    const entity = await this.getById(id);
    await this.repository.delete(entity.id);
  }
}
```

**Points clés:**
- ✅ Dépend du repository via **interface** (inversion de contrôle)
- ✅ Chaque méthode = 1 cas d'usage
- ✅ Valide les règles métier
- ✅ Langage du domaine dans les erreurs
- ✅ Pas de détails HTTP/DB

---

## 💾 Étape 4 : Implémenter le Repository (Prisma)

**Fichier:** `src/modules/{nom-module}/infrastructure/Prisma{Module}Repository.ts`

C'est l'**adaptateur** qui implémente l'interface pour Prisma.

```typescript
import type { PrismaClient, Prisma } from '@prisma/client';
import type { I{Module}Repository, FindOptions, FindResult } from '../domain/I{Module}Repository';
import { {Entity}, type {Entity}Props } from '../domain/{Entity}';

export class Prisma{Module}Repository implements I{Module}Repository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<{Entity} | null> {
    const row = await this.prisma.{tableName}.findUnique({
      where: { id },
      include: { /* relations si besoin */ },
    });
    return row ? this.toDomain(row) : null;
  }

  async findMany(opts: FindOptions): Promise<FindResult<{Entity}>> {
    const { page = 1, perPage = 20, search } = opts;
    const skip = (page - 1) * perPage;

    const where: Prisma.{TableName}WhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          // autres champs searchables
        ],
      }),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.{tableName}.findMany({ where, skip, take: perPage }),
      this.prisma.{tableName}.count({ where }),
    ]);

    return {
      items: rows.map(r => this.toDomain(r)),
      totalItems,
    };
  }

  async save(entity: {Entity}): Promise<{Entity}> {
    const row = await this.prisma.{tableName}.create({
      data: this.toPersistence(entity),
    });
    return this.toDomain(row);
  }

  async update(entity: {Entity}): Promise<{Entity}> {
    const { id, ...data } = this.toPersistence(entity);
    const row = await this.prisma.{tableName}.update({
      where: { id },
      data,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.{tableName}.delete({ where: { id } });
  }

  async exists(name: string): Promise<boolean> {
    const count = await this.prisma.{tableName}.count({ where: { name } });
    return count > 0;
  }

  // === Mappers : Domain ↔ Persistence ===
  private toDomain(row: Prisma.{TableName}GetPayload<object>): {Entity} {
    return {Entity}.create({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdById: row.createdById,
    });
  }

  private toPersistence(entity: {Entity}): Prisma.{TableName}CreateInput & { id: string } {
    const props = entity.toObject();
    return {
      id: props.id,
      name: props.name,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      createdBy: { connect: { id: props.createdById } },
    };
  }
}
```

**Points clés:**
- ✅ Implémente l'interface du domaine
- ✅ Mappers bidirectionnels : `toDomain()` et `toPersistence()`
- ✅ Pas de logique métier (juste persistence)
- ✅ Utilise `include` pour les relations Prisma

---

## 📤 Étape 5 : Créer les DTOs (Response Mappers)

**Fichier:** `src/modules/{nom-module}/dto/{Module}Response.dto.ts`

DTOs pour transformer les entités domaine en réponses API.

```typescript
export interface {Entity}ResponseDto {
  id: string;
  name: string;
  createdAt: string; // ISO string
  createdBy?: {
    id: string;
    name: string;
  };
}

export function to{Entity}ResponseDto(entity: any): {Entity}ResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    createdAt: entity.createdAt.toISOString(),
    createdBy: entity.createdBy ? {
      id: entity.createdBy.id,
      name: entity.createdBy.name,
    } : undefined,
  };
}
```

**Points clés:**
- ✅ DTOs pour la réponse API (jamais les entités directes!)
- ✅ Mapper explicite (fonctions pures)
- ✅ Pas de getter/setter, juste des fonctions

---

## 🎮 Étape 6 : Créer le Controller

**Fichier:** `src/modules/{nom-module}/{module}.controller.ts`

Le controller gère les **requêtes HTTP** et fait appel au service.

```typescript
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { {Module}Service } from './application/{module}.service';
import { ok } from '@/shared/types/api.types';

// Validations Zod
const CreateSchema = z.object({
  name: z.string().min(2).max(128),
});

export class {Module}Controller {
  constructor(private readonly service: {Module}Service) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, perPage = 20 } = req.query;
      const result = await this.service.list(
        parseInt(page as string) || 1,
        parseInt(perPage as string) || 20
      );
      res.json(ok(result.items, 'OK', { 
        page: parseInt(page as string) || 1,
        perPage: parseInt(perPage as string) || 20,
        totalItems: result.totalItems,
      }));
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const entity = await this.service.getById(req.params.id);
      res.json(ok(entity.toObject()));
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateSchema.parse(req.body);
      const entity = await this.service.create(dto, req.user!.id);
      res.status(201).json(ok(entity.toObject()));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateSchema.partial().parse(req.body);
      const entity = await this.service.update(req.params.id, dto);
      res.json(ok(entity.toObject()));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
```

**Points clés:**
- ✅ Valide input avec Zod
- ✅ Chaque handler ne fait qu'orchestrer (Service → Response)
- ✅ Gestion d'erreur centralisée via `next(err)`
- ✅ Try/catch simple

---

## 🛣️ Étape 7 : Créer les Routes

**Fichier:** `src/modules/{nom-module}/{module}.routes.ts`

Définit les endpoints Express avec le controller.

```typescript
import { Router } from 'express';
import { {Module}Controller } from './{module}.controller';
import { {Module}Service } from './application/{module}.service';
import { Prisma{Module}Repository } from './infrastructure/Prisma{Module}Repository';
import { authenticate, requireAdmin } from '@/shared/middlewares/auth.middleware';
import { publicApiRateLimiter } from '@/shared/middlewares/security.middleware';
import { db } from '@/config/database';

const router = Router();

// === Dependency Injection (Composition Root) ===
const repository = new Prisma{Module}Repository(db);
const service = new {Module}Service(repository);
const controller = new {Module}Controller(service);

// === Routes ===
router.get('/', publicApiRateLimiter, controller.list);
router.get('/:id', publicApiRateLimiter, controller.getById);
router.post('/', authenticate, controller.create);
router.patch('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.delete);

export default router;
```

**Points clés:**
- ✅ Composition root = point unique d'injection
- ✅ Tous les changements de dépendances ici
- ✅ Middlewares appliqués à chaque route
- ✅ Ordre : Lisibilité d'abord

---

## 📋 Étape 8 : Enregistrer le module dans l'app

**Fichier:** `src/app.ts`

```typescript
import {Module}Routes from '@/modules/{nom-module}/{module}.routes';

// ... autres imports ...

app.use('/api/v1/{nom-module}', {Module}Routes);
```

---

## ✅ Checklist complète

- [ ] Schéma Prisma créé (`schema.prisma`)
- [ ] `prisma migrate dev` exécuté
- [ ] Entity domaine créée (`domain/{Entity}.ts`)
- [ ] Interface Repository créée (`domain/I{Module}Repository.ts`)
- [ ] Service créé (`application/{module}.service.ts`)
- [ ] Repository Prisma créé (`infrastructure/Prisma{Module}Repository.ts`)
- [ ] DTOs créés (`dto/`)
- [ ] Controller créé (`{module}.controller.ts`)
- [ ] Routes créées (`{module}.routes.ts`)
- [ ] Module enregistré dans `app.ts`
- [ ] Tests unitaires écrits (service, repository)
- [ ] Swagger/OpenAPI documenté
- [ ] Build TypeScript valide (`npm run build`)

---

## 🎓 Exemple complet : Module Product

```
src/modules/product/
├── application/
│   └── product.service.ts
├── domain/
│   ├── Product.ts
│   ├── IProductRepository.ts
│   └── ProductErrors.ts
├── infrastructure/
│   └── PrismaProductRepository.ts
├── dto/
│   ├── ProductResponse.dto.ts
│   └── ProductMapper.ts
├── product.controller.ts
└── product.routes.ts
```

Commande pour générer le scaffolding :
```bash
# Crée la structure (si tu as un script)
npm run generate:module product
```

---

## 📚 Références Clean Architecture

**Dépendance:** Externe → Infrastructure → Application → Domain

```
Domain (0 dépendances)
  ↑ implémentée par
Application (dépend de Domain)
  ↑ utilisée par
Infrastructure (dépend d'Application + Domain)
  ↑ appelée par
Express Handlers / HTTP (dépend de tout)
```

**Points clés:**
- ✅ Le Domain **ne dépend** de rien
- ✅ L'Application dépend **uniquement** du Domain
- ✅ L'Infrastructure implémente les interfaces du Domain
- ✅ Les erreurs **remontent** (Exceptions, AppError)
- ✅ Les données **descendent** (DTOs)

---

## 🚫 Antipatterns à éviter

❌ **NE PAS:** Importer Prisma dans le Domain
```typescript
// MAUVAIS ❌
import type { User as PrismaUser } from '@prisma/client';
```

❌ **NE PAS:** Retourner des entités directes depuis le controller
```typescript
// MAUVAIS ❌
res.json(entity); // Retourner l'entité domaine brute
```

❌ **NE PAS:** Faire de la logique métier dans le controller
```typescript
// MAUVAIS ❌
const newPrice = entity.price * 1.1; // Ça va dans le Service!
```

❌ **NE PAS:** Bypass le Service depuis le controller
```typescript
// MAUVAIS ❌
const entity = await repository.findById(id); // Passer par le Service!
```

---

## ✨ Résumé rapide

| Layer | Responsabilité | Exemple |
|-------|-----------------|---------|
| **Domain** | Logique métier pure | `Product.create()`, validations |
| **Application** | Cas d'usage / Orchestration | `ProductService.list()` |
| **Infrastructure** | Détails techniques | `PrismaProductRepository` |
| **HTTP** | Requêtes/Réponses | `ProductController` |

Bonne chance ! 🚀
