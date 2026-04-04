"use strict";
// =============================================================================
// Application Service — CultureService
// Orchestration des cas d'usage (Use Cases).
// Équivalent Java : @Service CultureService
//
// NOTE ARCHITECTURALE : Ce service ne connaît PAS Prisma, MongoDB ou Express.
// Il parle uniquement au Repository via l'interface ICultureRepository.
// Pour migrer vers Java, réimplémenter ICultureRepository avec Spring Data JPA.
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultureService = void 0;
const crypto_1 = require("crypto");
const CulturePattern_1 = require("../domain/CulturePattern");
const AppError_1 = require("@/shared/errors/AppError");
const pagination_1 = require("@/shared/utils/pagination");
// ── Service ───────────────────────────────────────────────────────────────────
class CultureService {
    repository;
    // Injection de dépendance via constructeur (Inversion of Control)
    constructor(repository) {
        this.repository = repository;
    }
    // ── Cas d'usage : lister les motifs ───────────────────────────────────────
    async listPatterns(query, requesterId) {
        const { page, perPage, skip } = (0, pagination_1.parsePagination)(query);
        const { items, totalItems } = await this.repository.findMany({
            ...query,
            page, perPage,
            onlyPublished: !requesterId, // Les non-connectés voient uniquement les publiés
        });
        return { items, meta: (0, pagination_1.buildMeta)(totalItems, page, perPage) };
    }
    // ── Cas d'usage : récupérer un motif ──────────────────────────────────────
    async getPatternBySlug(slug) {
        const pattern = await this.repository.findBySlug(slug);
        if (!pattern) {
            throw new AppError_1.NotFoundError(`Motif "${slug}"`);
        }
        const updated = pattern.incrementView();
        return this.repository.update(updated);
    }
    // ── Cas d'usage : créer un motif ──────────────────────────────────────────
    async createPattern(dto) {
        const slug = this.generateSlug(dto.nameFr);
        if (await this.repository.exists(slug)) {
            throw new AppError_1.ConflictError(`Motif avec le slug "${slug}"`);
        }
        const pattern = CulturePattern_1.CulturePattern.create({
            ...dto,
            id: (0, crypto_1.randomUUID)(),
            slug,
            isPublished: false,
            isFeatured: false,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.repository.save(pattern);
    }
    // ── Cas d'usage : publier un motif ────────────────────────────────────────
    async publishPattern(id, requesterId, requesterRole) {
        if (!['curator', 'admin'].includes(requesterRole)) {
            throw new AppError_1.ForbiddenError('Seuls les curateurs et admins peuvent publier');
        }
        const pattern = await this.repository.findById(id);
        if (!pattern) {
            throw new AppError_1.NotFoundError(`Motif #${id}`);
        }
        return this.repository.update(pattern.publish());
    }
    // ── Cas d'usage : supprimer un motif ──────────────────────────────────────
    async deletePattern(id, requesterRole) {
        if (requesterRole !== 'admin') {
            throw new AppError_1.ForbiddenError('Seuls les admins peuvent supprimer');
        }
        const pattern = await this.repository.findById(id);
        if (!pattern) {
            throw new AppError_1.NotFoundError(`Motif #${id}`);
        }
        await this.repository.delete(id);
    }
    // ── Utilitaire : génération de slug ───────────────────────────────────────
    generateSlug(name) {
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
exports.CultureService = CultureService;
//# sourceMappingURL=culture.service.js.map