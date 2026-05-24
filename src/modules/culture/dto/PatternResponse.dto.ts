export interface PatternColor {
  hex: string;
  name: string;
  meaning: string;
}

export interface PatternSymbol {
  name: string;
  nameFr: string;
  cssPreview: string;
  meaning: string;
  usage: string;
  sacred: boolean;
  imageUrl?: string;
}

export interface PatternOrigin {
  people: string;
  region: string;
  country: string;
  flag: string;
  coords: [number, number];
}

export interface ArtisanQuote {
  text: string;
  author: string;
  role: string;
  country: string;
}

export interface PatternDoc {
  id: string;
  slug: string;
  nameFr: string;
  nameLocal: string;
  type: string;
  svgPattern?: string;
  cssClass: string;
  storagePath?: string;
  svgUrl?: string;
  origin: PatternOrigin;
  era: string;
  license: string;
  colors: PatternColor[];
  summary: string;
  history: string;
  technique: string;
  symbolism: string;
  ceremonial: string;
  symbols: PatternSymbol[];
  artisanQuote?: ArtisanQuote;
  sources: string[];
  downloads: number;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export function toPatternDoc(domain: any): PatternDoc {
  const metadata = domain.metadata || {};
  const colors = metadata.colors || [
    { hex: domain.colors?.primary || '#C0573E', name: 'Primaire', meaning: 'Couleur principale' },
    { hex: domain.colors?.secondary || '#F5EBE0', name: 'Secondaire', meaning: 'Couleur secondaire' },
  ];
  if (domain.colors?.accent) {
    colors.push({ hex: domain.colors.accent, name: 'Accent', meaning: 'Couleur d\'accent' });
  }

  return {
    id: domain.id,
    slug: domain.slug,
    nameFr: domain.nameFr,
    nameLocal: metadata.nameLocal || domain.nameFr,
    type: domain.patternType?.toUpperCase() || 'NDOP',
    svgPattern: metadata.svgPattern,
    cssClass: `pattern-${domain.patternType?.toLowerCase() || 'ndop'}`,
    storagePath: metadata.svgFilePath,
    svgUrl: domain.svgUrl,
    origin: {
      people: metadata.people || '',
      region: domain.region || '',
      country: domain.country || '',
      flag: metadata.flag || '',
      coords: metadata.coords || [0, 0],
    },
    era: metadata.era || '',
    license: metadata.license || 'cc-by',
    colors,
    summary: metadata.summary || domain.descFr || '',
    history: metadata.history || '',
    technique: metadata.technique || '',
    symbolism: domain.symbolism?.meaning || metadata.symbolism || '',
    ceremonial: metadata.ceremonial || '',
    symbols: metadata.symbols || [],
    artisanQuote: metadata.artisanQuote,
    sources: metadata.sources || [],
    downloads: 0, // TODO: implement download count
    views: domain.viewCount || 0,
    createdAt: domain.createdAt?.toISOString(),
    updatedAt: domain.updatedAt?.toISOString(),
  };
}
