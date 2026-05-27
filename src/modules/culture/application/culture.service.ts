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
import { CulturePattern, type CulturePatternProps, type PatternType } from '../domain/CulturePattern';
import type { ICultureRepository, FindPatternsOptions } from '../domain/ICultureRepository';
import type { PaginationMeta } from '@/shared/types/api.types';
import { NotFoundError, ConflictError, ForbiddenError } from '@/shared/errors/AppError';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';

// ── DTOs (Data Transfer Objects) ──────────────────────────────────────────────

export interface CreatePatternDto {
  name:       string | null;
  nameLocal:  string;
  imgUrl?:    string | null;
  type:       PatternType;
  cssClass:   string;
  era?:       string | null;
  license?:   string | null;
  summary:    string;
  history:    string;
  technique:  string;
  symbolism:  string;
  ceremonial: string;
  sources?:   string[];
}

export interface UpdatePatternDto extends Partial<CreatePatternDto> {}

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
  constructor(private readonly repository: ICultureRepository) {}

  // ── Cas d'usage : lister les motifs ───────────────────────────────────────
  async listPatterns(query: QueryPatternDto, requesterId?: string): Promise<PatternListResult> {
    const { page, perPage, skip } = parsePagination(query);

    const { items, totalItems } = await this.repository.findMany({
      ...query,
      page, perPage,
      onlyPublished: !requesterId,
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
    const slug = this.generateSlug(dto.nameLocal);

    if (await this.repository.exists(slug)) {
      throw new ConflictError(`Motif avec le slug "${slug}"`);
    }

    const pattern = CulturePattern.create({
      id:          randomUUID(),
      slug,
      name:        dto.name,
      nameLocal:   dto.nameLocal,
      imgUrl:      dto.imgUrl ?? null,
      type:        dto.type,
      cssClass:    dto.cssClass,
      era:         dto.era ?? null,
      license:     dto.license ?? null,
      summary:     dto.summary,
      history:     dto.history,
      technique:   dto.technique,
      symbolism:   dto.symbolism,
      ceremonial:  dto.ceremonial,
      sources:     dto.sources ?? [],
      downloads:   0,
      views:       0,
      isPublished: false,
      isFeatured:  false,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    });

    return this.repository.save(pattern);
  }

  // ── Cas d'usage : mettre à jour un motif ──────────────────────────────────
  async updatePattern(id: string, dto: UpdatePatternDto, requesterRole: string): Promise<CulturePattern> {
    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    if (!['curator', 'admin'].includes(requesterRole)) {
      throw new ForbiddenError('Seuls les curateurs et admins peuvent modifier');
    }

    const updated = pattern.update(dto);
    return this.repository.update(updated);
  }

  // ── Cas d'usage : publier un motif ────────────────────────────────────────
  async publishPattern(id: string, requesterRole: string): Promise<CulturePattern> {
    if (!['curator', 'admin'].includes(requesterRole)) {
      throw new ForbiddenError('Seuls les curateurs et admins peuvent publier');
    }

    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    return this.repository.update(pattern.publish());
  }

  // ── Cas d'usage : mettre en avant un motif ────────────────────────────────
  async featurePattern(id: string, requesterRole: string): Promise<CulturePattern> {
    if (requesterRole !== 'admin') {
      throw new ForbiddenError('Seuls les admins peuvent mettre en avant un motif');
    }

    const pattern = await this.repository.findById(id);
    if (!pattern) { throw new NotFoundError(`Motif #${id}`); }

    return this.repository.update(pattern.feature());
  }

  // ── Cas d'usage : incrémenter les téléchargements ─────────────────────────
  async trackDownload(slug: string): Promise<CulturePattern> {
    const pattern = await this.repository.findBySlug(slug);
    if (!pattern) { throw new NotFoundError(`Motif "${slug}"`); }

    return this.repository.update(pattern.incrementDownload());
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