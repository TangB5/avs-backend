// =============================================================================
// Application Service — CultureService
// Orchestration des cas d'usage (Use Cases).
// Équivalent Java : @Service CultureService
//
// NOTE ARCHITECTURALE : Ce service ne connaît PAS Prisma, MongoDB ou Express.
// Il parle uniquement au Repository via l'interface ICultureRepository.
// Pour migrer vers Java, réimplémenter ICultureRepository avec Spring Data JPA.
// =============================================================================

import { randomUUID } from 'crypto';
import { CulturePattern, type CulturePatternProps } from '../domain/CulturePattern';
import type { ICultureRepository, FindPatternsOptions } from '../domain/ICultureRepository';
import type { PaginationMeta } from '@/shared/types/api.types';
import { NotFoundError, ConflictError, ForbiddenError } from '@/shared/errors/AppError';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';

// ── DTOs (Data Transfer Objects) ──────────────────────────────────────────────
export interface CreatePatternDto {
  nameFr:      string;
  nameEn:      string;
  descFr:      string;
  descEn:      string;
  patternType: CulturePatternProps['patternType'];
  region:      CulturePatternProps['region'];
  country:     string;
  colors:      CulturePatternProps['colors'];
  symbolism:   CulturePatternProps['symbolism'];
  createdById: string;
}

export interface UpdatePatternDto extends Partial<Omit<CreatePatternDto, 'createdById'>> {}

export interface QueryPatternDto extends FindPatternsOptions {
  page?:    number;
  perPage?: number;
}

export interface PatternListResult {
  items: CulturePattern[];
  meta:  PaginationMeta;
}

// ── Service ───────────────────────────────────────────────────────────────────
export class CultureService {
  // Injection de dépendance via constructeur (Inversion of Control)
  constructor(private readonly repository: ICultureRepository) {}

  // ── Cas d'usage : lister les motifs ───────────────────────────────────────
  async listPatterns(query: QueryPatternDto, requesterId?: string): Promise<PatternListResult> {
    const { page, perPage, skip } = parsePagination(query);

    const { items, totalItems } = await this.repository.findMany({
      ...query,
      page, perPage,
      onlyPublished: !requesterId, // Les non-connectés voient uniquement les publiés
    });

    return { items, meta: buildMeta(totalItems, page, perPage) };
  }

  // ── Cas d'usage : récupérer un motif ──────────────────────────────────────
  async getPatternBySlug(slug: string): Promise<CulturePattern> {
    const pattern = await this.repository.findBySlug(slug);
    if (!pattern) { throw new NotFoundError(`Motif "${slug}"`); }

    const updated = pattern.incrementView();
    return this.repository.update(updated);
  }

  // ── Cas d'usage : créer un motif ──────────────────────────────────────────
  async createPattern(dto: CreatePatternDto): Promise<CulturePattern> {
    const slug = this.generateSlug(dto.nameFr);

    if (await this.repository.exists(slug)) {
      throw new ConflictError(`Motif avec le slug "${slug}"`);
    }

    const pattern = CulturePattern.create({
      ...dto,
      id:          randomUUID(),
      slug,
      isPublished: false,
      isFeatured:  false,
      viewCount:   0,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    });

    return this.repository.save(pattern);
  }

  // ── Cas d'usage : mettre à jour un motif ────────────────────────────────────
  async updatePattern(id: string, dto: UpdatePatternDto, requesterId: string, requesterRole: string): Promise<CulturePattern> {
    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    // Check permissions (creator or admin can update)
    if (pattern.createdById !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('Seul le créateur ou un admin peut modifier');
    }

    // Update pattern with new data
    const updated = pattern.update(dto);
    return this.repository.update(updated);
  }

  // ── Cas d'usage : publier un motif ────────────────────────────────────────
  async publishPattern(id: string, requesterId: string, requesterRole: string): Promise<CulturePattern> {
    if (!['curator', 'admin'].includes(requesterRole)) {
      throw new ForbiddenError('Seuls les curateurs et admins peuvent publier');
    }
    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    return this.repository.update(pattern.publish());
  }

  // ── Cas d'usage : supprimer un motif ──────────────────────────────────────
  async deletePattern(id: string, requesterRole: string): Promise<void> {
    if (requesterRole !== 'admin') {
      throw new ForbiddenError('Seuls les admins peuvent supprimer');
    }
    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    await this.repository.delete(id);
  }

  // ── Utilitaire : génération de slug ───────────────────────────────────────
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 64);
  }
}
