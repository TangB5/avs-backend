"use strict";
// =============================================================================
// Domain Entity — CulturePattern
// Logique métier pure, indépendante de toute infrastructure.
// Équivalent Java : @Entity + Domain Object Pattern
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulturePattern = void 0;
// ── Entité domaine (Value Object + comportements) ──────────────────────────────
class CulturePattern {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        // Règles métier (invariants)
        if (!props.slug.match(/^[a-z0-9-]+$/)) {
            throw new Error('Slug invalide : minuscules, chiffres et tirets uniquement');
        }
        if (props.country.length !== 2) {
            throw new Error('Code pays ISO 3166-1 alpha-2 requis (2 caractères)');
        }
        return new CulturePattern(props);
    }
    // Accesseurs (immutabilité)
    get id() { return this.props.id; }
    get slug() { return this.props.slug; }
    get nameFr() { return this.props.nameFr; }
    get nameEn() { return this.props.nameEn; }
    get isPublished() { return this.props.isPublished; }
    get isFeatured() { return this.props.isFeatured; }
    get viewCount() { return this.props.viewCount; }
    get colors() { return { ...this.props.colors }; }
    get symbolism() { return { ...this.props.symbolism }; }
    get region() { return this.props.region; }
    get patternType() { return this.props.patternType; }
    // Comportements domaine
    publish() {
        return new CulturePattern({ ...this.props, isPublished: true, updatedAt: new Date() });
    }
    unpublish() {
        return new CulturePattern({ ...this.props, isPublished: false, updatedAt: new Date() });
    }
    incrementView() {
        return new CulturePattern({ ...this.props, viewCount: this.props.viewCount + 1 });
    }
    toObject() { return { ...this.props }; }
}
exports.CulturePattern = CulturePattern;
//# sourceMappingURL=CulturePattern.js.map