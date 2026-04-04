import type { Palette } from '@prisma/client';
export interface ColorTokenInput {
    name: string;
    hex: string;
    meaning: string;
    origin: string;
    css: string;
}
export interface CreatePaletteDto {
    name: string;
    origin: string;
    description: string;
    patternCSS?: string;
    tokens: ColorTokenInput[];
}
export interface PaletteListParams {
    page: number;
    perPage: number;
}
export declare class PaletteService {
    private readonly repository;
    constructor(repository: any);
    listPalettes(params: PaletteListParams): Promise<{
        items: Palette[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            pages: number;
        };
    }>;
    getPaletteById(id: string): Promise<Palette>;
    createPalette(data: CreatePaletteDto): Promise<Palette>;
    updatePalette(id: string, data: Partial<CreatePaletteDto>): Promise<Palette>;
    publishPalette(id: string): Promise<Palette>;
    deletePalette(id: string): Promise<void>;
}
//# sourceMappingURL=palette.service.d.ts.map