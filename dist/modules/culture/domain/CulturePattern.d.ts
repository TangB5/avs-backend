export type PatternType = 'kente' | 'bogolan' | 'adinkra' | 'ndebele' | 'kuba' | 'ndop' | 'wax';
export type Region = 'west-africa' | 'east-africa' | 'central-africa' | 'north-africa' | 'south-africa' | 'diaspora';
export type UsageType = 'ceremonial' | 'daily' | 'royal' | 'spiritual' | 'universal';
export interface CulturePatternProps {
    id: string;
    slug: string;
    nameFr: string;
    nameEn: string;
    descFr: string;
    descEn: string;
    patternType: PatternType;
    region: Region;
    country: string;
    colors: PatternColors;
    symbolism: PatternSymbolism;
    isPublished: boolean;
    isFeatured: boolean;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
}
export interface PatternColors {
    primary: string;
    secondary: string;
    accent?: string;
}
export interface PatternSymbolism {
    meaning: string;
    keywords: string[];
    usage: UsageType;
}
export declare class CulturePattern {
    private readonly props;
    private constructor();
    static create(props: CulturePatternProps): CulturePattern;
    get id(): string;
    get slug(): string;
    get nameFr(): string;
    get nameEn(): string;
    get isPublished(): boolean;
    get isFeatured(): boolean;
    get viewCount(): number;
    get colors(): PatternColors;
    get symbolism(): PatternSymbolism;
    get region(): Region;
    get patternType(): PatternType;
    publish(): CulturePattern;
    unpublish(): CulturePattern;
    incrementView(): CulturePattern;
    toObject(): CulturePatternProps;
}
//# sourceMappingURL=CulturePattern.d.ts.map