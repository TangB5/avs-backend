import { CultureService } from '@/modules/culture/application/culture.service';
import type { ICultureRepository, FindResult } from '@/modules/culture/domain/ICultureRepository';
import { CulturePattern } from '@/modules/culture/domain/CulturePattern';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';

// ── Mock Repository ───────────────────────────────────────────────────────────
const mockRepo: jest.Mocked<ICultureRepository> = {
  findById:    jest.fn(),
  findBySlug:  jest.fn(),
  findMany:    jest.fn(),
  save:        jest.fn(),
  update:      jest.fn(),
  delete:      jest.fn(),
  exists:      jest.fn(),
};

const service = new CultureService(mockRepo);

const makePattern = (overrides = {}): CulturePattern =>
  CulturePattern.create({
    id: 'test-uuid', slug: 'test-slug',
    nameFr: 'Test', nameEn: 'Test',
    descFr: 'Description FR', descEn: 'Description EN',
    patternType: 'kente', region: 'west-africa', country: 'GH',
    colors: { primary: '#C0573E', secondary: '#F5EBE0' },
    symbolism: { meaning: 'Royauté', keywords: ['test'], usage: 'ceremonial' },
    isPublished: true, isFeatured: false, viewCount: 0,
    createdAt: new Date(), updatedAt: new Date(), createdById: 'user-1',
    ...overrides,
  });

describe('CultureService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getPatternBySlug', () => {
    it('retourne le motif et incrémente les vues', async () => {
      const pattern = makePattern();
      mockRepo.findBySlug.mockResolvedValue(pattern);
      mockRepo.update.mockImplementation(p => Promise.resolve(p));

      const result = await service.getPatternBySlug('test-slug');

      expect(mockRepo.findBySlug).toHaveBeenCalledWith('test-slug');
      expect(mockRepo.update).toHaveBeenCalled();
      expect(result.viewCount).toBe(1);
    });

    it('lève NotFoundError si le motif est absent', async () => {
      mockRepo.findBySlug.mockResolvedValue(null);
      await expect(service.getPatternBySlug('inconnu')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createPattern', () => {
    it('lève ConflictError si le slug existe déjà', async () => {
      mockRepo.exists.mockResolvedValue(true);
      await expect(service.createPattern({
        nameFr: 'Kente', nameEn: 'Kente',
        descFr: 'Desc', descEn: 'Desc',
        patternType: 'kente', region: 'west-africa', country: 'GH',
        colors: { primary: '#C0573E', secondary: '#F5EBE0' },
        symbolism: { meaning: 'Royauté', keywords: ['kente'], usage: 'ceremonial' },
        createdById: 'user-1',
      })).rejects.toThrow(ConflictError);
    });
  });
});
