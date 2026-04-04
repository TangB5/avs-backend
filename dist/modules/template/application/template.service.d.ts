import type { Template } from '@prisma/client';
export interface TemplateListParams {
    page: number;
    perPage: number;
    category?: string;
    framework?: string;
}
export declare class TemplateService {
    private readonly repository;
    constructor(repository: any);
    listTemplates(params: TemplateListParams): Promise<{
        items: Template[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            pages: number;
        };
    }>;
    getTemplateById(id: string): Promise<Template>;
    getFeatured(): Promise<Template[]>;
}
//# sourceMappingURL=template.service.d.ts.map