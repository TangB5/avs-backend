// =============================================================================
// Domain Entity — CulturePattern
// Logique métier pure, indépendante de toute infrastructure.
// Équivalent Java : @Entity + Domain Object Pattern
// =============================================================================

export type PatternType = 'kente'|'bogolan'|'adinkra'|'ndebele'|'kuba'|'ndop'|'wax';
export type Region      = 'west-africa'|'east-africa'|'central-africa'|'north-africa'|'south-africa'|'diaspora';
export type UsageType   = 'ceremonial'|'daily'|'royal'|'spiritual'|'universal';

export interface CulturePatternProps {
  id:          string;
  slug:        string;
  nameFr:      string;
  nameEn:      string;
  descFr:      string;
  descEn:      string;
  patternType: PatternType;
  region:      Region;
  country:     string;        // ISO 3166-1 alpha-2
  colors:      PatternColors;
  symbolism:   PatternSymbolism;
  isPublished: boolean;
  isFeatured:  boolean;
  viewCount:   number;
  createdAt:   Date;
  updatedAt:   Date;
  createdById: string;
}

export interface PatternColors {
  primary:    string;
  secondary:  string;
  accent?:    string;
}

export interface PatternSymbolism {
  meaning:  string;
  keywords: string[];
  usage:    UsageType;
}

// ── Entité domaine (Value Object + comportements) ──────────────────────────────
export class CulturePattern {
  private constructor(private readonly props: CulturePatternProps) {}

  static create(props: CulturePatternProps): CulturePattern {
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
  get id():          string           { return this.props.id; }
  get slug():        string           { return this.props.slug; }
  get nameFr():      string           { return this.props.nameFr; }
  get nameEn():      string           { return this.props.nameEn; }
  get isPublished(): boolean          { return this.props.isPublished; }
  get isFeatured():  boolean          { return this.props.isFeatured; }
  get viewCount():   number           { return this.props.viewCount; }
  get colors():      PatternColors    { return { ...this.props.colors }; }
  get symbolism():   PatternSymbolism { return { ...this.props.symbolism }; }
  get region():      Region           { return this.props.region; }
  get patternType(): PatternType      { return this.props.patternType; }

  // Comportements domaine
  publish(): CulturePattern {
    return new CulturePattern({ ...this.props, isPublished: true, updatedAt: new Date() });
  }

  unpublish(): CulturePattern {
    return new CulturePattern({ ...this.props, isPublished: false, updatedAt: new Date() });
  }

  incrementView(): CulturePattern {
    return new CulturePattern({ ...this.props, viewCount: this.props.viewCount + 1 });
  }

  toObject(): CulturePatternProps { return { ...this.props }; }
}
