import type { Template } from '@prisma/client';

export interface TemplateListParams {
  page: number;
  perPage: number;
  category?: string;
  framework?: string;
}

export class TemplateService {
  constructor(private readonly repository: any) {}

  async listTemplates(params: TemplateListParams): Promise<{
    items: Template[];
    meta: { page: number; perPage: number; total: number; pages: number };
  }> {
    const skip = (params.page - 1) * params.perPage;
    const [items, total] = await Promise.all([
      this.repository.findFiltered({
        skip,
        take: params.perPage,
        category: params.category,
        framework: params.framework,
        isPublished: true,
      }),
      this.repository.countFiltered({
        category: params.category,
        framework: params.framework,
        isPublished: true,
      }),
    ]);

    return {
      items,
      meta: {
        page: params.page,
        perPage: params.perPage,
        total,
        pages: Math.ceil(total / params.perPage),
      },
    };
  }

  async getTemplateById(id: string): Promise<Template> {
    const template = await this.repository.findById(id);
    if (!template) throw new Error('Template not found');
    return template;
  }

  async getFeatured(): Promise<Template[]> {
    return this.repository.findFeatured(5);
  }
}
