import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { CultureService } from '@/modules/culture/application/culture.service';
import { ok } from '@/shared/types/api.types';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@/shared/utils/logger';
import { createStorageService } from '@/infra/storage/storage.factory';


// ── Multer configuration for SVG file upload ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'patterns');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isSvgField = file.fieldname === 'svgFile';
  const isImageField = file.fieldname.startsWith('symbolImage_');
  
  if (isSvgField) {
    if (file.mimetype === 'image/svg+xml' || path.extname(file.originalname).toLowerCase() === '.svg') {
      cb(null, true);
    } else {
      cb(new Error('Only SVG files are allowed for svgFile'));
    }
  } else if (isImageField) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for symbol images'));
    }
  } else {
    cb(new Error('Unknown file field'));
  }
};

export const uploadSvg = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 21, // 1 SVG + up to 20 symbol images
  },
});

// ── Comprehensive Zod Schema matching frontend 3-step form ─────────────────────
const ColorSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid HEX color'),
  name: z.string().min(1, 'Color name required'),
  meaning: z.string().min(1, 'Color meaning required'),
});

const ArtisanQuoteSchema = z
  .object({
    text: z.string().min(10, 'Quote text must be at least 10 characters').max(500),
    author: z.string().min(2, 'Author name required').max(128),
    role: z.string().min(2, 'Role required').max(128),
    country: z.string().min(2, 'Country required').max(64),
  })
  .optional();

const SymbolSchema = z.object({
  name: z.string().min(1, 'Symbol name required'),
  nameFr: z.string().min(1, 'French name required'),
  cssPreview: z.string().min(1, 'CSS preview required'),
  meaning: z.string().min(1, 'Symbol meaning required'),
  usage: z.string().min(1, 'Symbol usage required'),
  sacred: z.boolean(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

const CreateSchema = z.object({
  // Step 1: Identity
  nameFr: z.string().min(2, 'Minimum 2 characters').max(128),
  nameLocal: z.string().min(2, 'Minimum 2 characters').max(128),
  nameEn: z.string().min(2, 'Minimum 2 characters').max(128),
  patternType: z.enum(['kente', 'bogolan', 'adinkra', 'ndebele', 'kuba', 'ndop', 'wax']),
  region: z.enum([
    'west-africa',
    'east-africa',
    'central-africa',
    'north-africa',
    'south-africa',
    'diaspora',
  ]),
  country: z.string().length(2, 'Country code must be 2 characters').toUpperCase(),
  people: z.string().max(128).optional(),
  flag: z.string().max(8).optional(),
  coords: z.tuple([z.number(), z.number()]).optional(),
  kingdom: z.string().max(128).optional(),
  era: z.string().max(64).optional(),
  license: z.enum(['cc0', 'cc-by', 'cc-by-sa']).default('cc-by'),

  // Step 2: Description
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500),
  descFr: z.string().min(20, 'French description must be at least 20 characters').max(2000),
  descEn: z.string().min(20, 'English description must be at least 20 characters').max(2000),
  history: z.string().min(10, 'History must be at least 10 characters').max(2000),
  technique: z.string().min(10, 'Technique must be at least 10 characters').max(1000),
  symbolMeaning: z.string().min(10, 'Symbol meaning must be at least 10 characters').max(512),
  ceremonial: z.string().min(10, 'Ceremonial usage must be at least 10 characters').max(1000),
  symbolUsage: z.enum(['ceremonial', 'daily', 'royal', 'spiritual', 'universal']),
  symbolKeywords: z.array(z.string().min(1)).min(1, 'At least one keyword required').max(10),

  // Step 3: Colors & Assets
  colors: z.array(ColorSchema).min(2, 'At least 2 colors required').max(5),
  svgPattern: z.string().optional(),
  artisanQuote: ArtisanQuoteSchema,
  sources: z.array(z.string().min(1)).min(1, 'At least one source required').max(10),
  symbols: z.array(SymbolSchema).min(1, 'At least one symbol required').max(20),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  region: z
    .enum([
      'west-africa',
      'east-africa',
      'central-africa',
      'north-africa',
      'south-africa',
      'diaspora',
    ])
    .optional(),
  patternType: z.enum(['kente', 'bogolan', 'adinkra', 'ndebele', 'kuba', 'ndop', 'wax']).optional(),
  search: z.string().max(128).optional(),
});

// ── Factory — injection du service ───────────────────────────────────────────
export class CultureController {
  constructor(private readonly service: CultureService) {}

  private storage = createStorageService();
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = QuerySchema.parse(req.query);
      const result = await this.service.listPatterns(query, req.user?.userId);
      res.json(ok(result.items, 'OK', result.meta));
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (
    req: Request<{ slug: string }>, // ✅ ici
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pattern = await this.service.getPatternBySlug(req.params.slug);
      res.json(ok(pattern.toObject()));
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Handle FormData parsing
      const formData: any = {};

      // Parse all form fields
      for (const [key, value] of Object.entries(req.body)) {
        if (value === undefined || value === null) continue;

        // Parse JSON fields
        if (typeof value === 'string') {
          try {
            formData[key] = JSON.parse(value);
          } catch {
            formData[key] = value;
          }
        } else {
          formData[key] = value;
        }
      }

      // Handle SVG file if uploaded
      if (req.files && typeof req.files === 'object' && 'svgFile' in req.files) {
        const svgFiles = req.files.svgFile;
        logger.info(`[CultureController.create] SVG files received: ${svgFiles?.length || 0}`);
        if (svgFiles && Array.isArray(svgFiles) && svgFiles.length > 0 && svgFiles[0]) {
          logger.info(`[CultureController.create] Uploading SVG file: ${svgFiles[0].originalname}`);
          const uploadResult = await this.storage.upload(svgFiles[0], 'patterns');

          formData.svgFilePath = uploadResult.url;
          formData.svgKey = uploadResult.key;
          formData.svgProvider = uploadResult.provider;

          logger.info(`[CultureController.create] SVG uploaded: ${uploadResult.provider} - ${uploadResult.key}`);
        }
      } else {
        logger.info(`[CultureController.create] No SVG files in req.files`);
      }

      // Handle symbol images if uploaded
      const symbolImages: { [key: string]: string } = {};
      
      if (req.files && typeof req.files === 'object') {
        logger.info(`[CultureController.create] Processing symbol images from req.files`);
        const fileKeys = Object.keys(req.files);
        logger.info(`[CultureController.create] Available fields: ${fileKeys.join(', ')}`);
        
        for (const [fieldname, files] of Object.entries(req.files)) {
          if (fieldname.startsWith('symbolImage_') && Array.isArray(files) && files.length > 0 && files[0]) {
            const symbolIndex = fieldname.replace('symbolImage_', '');
            logger.info(`[CultureController.create] Uploading symbol image ${symbolIndex}: ${files[0].originalname}`);
            const uploadResult = await this.storage.upload(files[0], 'symbols');
            symbolImages[symbolIndex] = uploadResult.url;
            logger.info(`[CultureController.create] Symbol image uploaded: ${uploadResult.provider} - ${uploadResult.key} -> ${uploadResult.url}`);
          }
        }
      } else {
        logger.info(`[CultureController.create] No req.files object`);
      }

      logger.info(`[CultureController.create] Total symbol images collected: ${Object.keys(symbolImages).length}`);

      // Add image URLs to symbols
      if (formData.symbols && Array.isArray(formData.symbols)) {
        formData.symbols = formData.symbols.map((symbol: any, index: number) => ({
          ...symbol,
          imageUrl: symbolImages[index.toString()] || symbol.imageUrl
        }));
      }

      // Validate with Zod schema
      const validatedData = CreateSchema.parse(formData);

      // Transform comprehensive form data to match existing service DTO
      const serviceDto = {
        nameFr: validatedData.nameFr,
        nameEn: validatedData.nameEn,
        descFr: validatedData.descFr,
        descEn: validatedData.descEn,
        patternType: validatedData.patternType,
        region: validatedData.region,
        country: validatedData.country,
        colors: {
          primary: validatedData.colors[0]?.hex || '#C0573E',
          secondary: validatedData.colors[1]?.hex || '#F5EBE0',
          accent: validatedData.colors[2]?.hex,
        },
        symbolism: {
          meaning: validatedData.symbolMeaning,
          keywords: validatedData.symbolKeywords,
          usage: validatedData.symbolUsage,
        },
        // Additional fields from comprehensive form (stored as metadata)
        metadata: {
          nameLocal: validatedData.nameLocal,
          people: validatedData.people,
          flag: validatedData.flag,
          coords: validatedData.coords,
          kingdom: validatedData.kingdom,
          era: validatedData.era,
          license: validatedData.license,
          summary: validatedData.summary,
          history: validatedData.history,
          technique: validatedData.technique,
          ceremonial: validatedData.ceremonial,
          colors: validatedData.colors, // Full color objects with names/meanings
          svgPattern: validatedData.svgPattern,
          artisanQuote: validatedData.artisanQuote,
          sources: validatedData.sources,
          symbols: validatedData.symbols,
          svgFilePath: formData.svgFilePath,
        },
        createdById: req.user!.userId,
      };

      const result = await this.service.createPattern(serviceDto);
      logger.info(`Pattern created: ${result.id} - ${result.nameFr}`);

      res
        .status(StatusCodes.CREATED)
        .json(ok(result.toObject(), 'Pattern created successfully and submitted for review'));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Handle FormData parsing
      const formData: any = {};

      // Parse all form fields
      for (const [key, value] of Object.entries(req.body)) {
        if (value === undefined || value === null) continue;

        // Parse JSON fields
        if (typeof value === 'string') {
          try {
            formData[key] = JSON.parse(value);
          } catch {
            formData[key] = value;
          }
        } else {
          formData[key] = value;
        }
      }

      
      if (req.files && typeof req.files === 'object' && 'svgFile' in req.files) {
        const svgFiles = req.files.svgFile;
        logger.info(`[CultureController.update] SVG files received: ${svgFiles?.length || 0}`);
        if (svgFiles && Array.isArray(svgFiles) && svgFiles.length > 0 && svgFiles[0]) {
          logger.info(`[CultureController.update] Uploading SVG file: ${svgFiles[0].originalname}`);
          const uploadResult = await this.storage.upload(svgFiles[0], 'patterns');

          formData.svgFilePath = uploadResult.url;
          formData.svgKey = uploadResult.key;
          formData.svgProvider = uploadResult.provider;
          logger.info(`[CultureController.update] SVG uploaded successfully`);
        }
      } else {
        logger.info(`[CultureController.update] No SVG files in req.files`);
      }

      // Handle symbol images if uploaded
      const symbolImages: { [key: string]: string } = {};
      
      if (req.files && typeof req.files === 'object') {
        logger.info(`[CultureController.update] Processing symbol images from req.files`);
        const fileKeys = Object.keys(req.files);
        logger.info(`[CultureController.update] Available fields: ${fileKeys.join(', ')}`);
        
        for (const [fieldname, files] of Object.entries(req.files)) {
          if (fieldname.startsWith('symbolImage_') && Array.isArray(files) && files.length > 0 && files[0]) {
            const symbolIndex = fieldname.replace('symbolImage_', '');
            logger.info(`[CultureController.update] Uploading symbol image ${symbolIndex}: ${files[0].originalname}`);
            const uploadResult = await this.storage.upload(files[0], 'symbols');
            symbolImages[symbolIndex] = uploadResult.url;
            logger.info(`[CultureController.update] Symbol image uploaded: ${uploadResult.provider} - ${uploadResult.key}`);
          }
        }
      } else {
        logger.info(`[CultureController.update] No req.files object`);
      }

      // Add image URLs to symbols
      if (formData.symbols && Array.isArray(formData.symbols)) {
        formData.symbols = formData.symbols.map((symbol: any, index: number) => ({
          ...symbol,
          imageUrl: symbolImages[index.toString()] || symbol.imageUrl
        }));
      }

      // Create partial schema for updates (all fields optional)
      const UpdateSchema = CreateSchema.partial();
      const validatedData = UpdateSchema.parse(formData);

      // Transform comprehensive form data to match existing service DTO
      const serviceDto: any = {};

      // Map basic fields if provided
      if (validatedData.nameFr) serviceDto.nameFr = validatedData.nameFr;
      if (validatedData.nameEn) serviceDto.nameEn = validatedData.nameEn;
      if (validatedData.descFr) serviceDto.descFr = validatedData.descFr;
      if (validatedData.descEn) serviceDto.descEn = validatedData.descEn;
      if (validatedData.patternType) serviceDto.patternType = validatedData.patternType;
      if (validatedData.region) serviceDto.region = validatedData.region;
      if (validatedData.country) serviceDto.country = validatedData.country;

      // Map colors if provided
      if (validatedData.colors) {
        serviceDto.colors = {
          primary: validatedData.colors[0]?.hex,
          secondary: validatedData.colors[1]?.hex,
          accent: validatedData.colors[2]?.hex,
        };
      }

      // Map symbolism if provided
      if (
        validatedData.symbolMeaning ||
        validatedData.symbolKeywords ||
        validatedData.symbolUsage
      ) {
        serviceDto.symbolism = {};
        if (validatedData.symbolMeaning) serviceDto.symbolism.meaning = validatedData.symbolMeaning;
        if (validatedData.symbolKeywords)
          serviceDto.symbolism.keywords = validatedData.symbolKeywords;
        if (validatedData.symbolUsage) serviceDto.symbolism.usage = validatedData.symbolUsage;
      }

      // Additional fields from comprehensive form (stored as metadata)
      const metadata: any = {};
      if (validatedData.nameLocal) metadata.nameLocal = validatedData.nameLocal;
      if (validatedData.people) metadata.people = validatedData.people;
      if (validatedData.flag) metadata.flag = validatedData.flag;
      if (validatedData.coords) metadata.coords = validatedData.coords;
      if (validatedData.kingdom) metadata.kingdom = validatedData.kingdom;
      if (validatedData.era) metadata.era = validatedData.era;
      if (validatedData.license) metadata.license = validatedData.license;
      if (validatedData.summary) metadata.summary = validatedData.summary;
      if (validatedData.history) metadata.history = validatedData.history;
      if (validatedData.technique) metadata.technique = validatedData.technique;
      if (validatedData.ceremonial) metadata.ceremonial = validatedData.ceremonial;
      if (validatedData.colors) metadata.colors = validatedData.colors;
      if (validatedData.svgPattern) metadata.svgPattern = validatedData.svgPattern;
      if (validatedData.artisanQuote) metadata.artisanQuote = validatedData.artisanQuote;
      if (validatedData.sources) metadata.sources = validatedData.sources;
      if (validatedData.symbols) metadata.symbols = validatedData.symbols;
      if (formData.svgFilePath) metadata.svgFilePath = formData.svgFilePath;

      if (Object.keys(metadata).length > 0) {
        serviceDto.metadata = metadata;
      }

      const result = await this.service.updatePattern(
        req.params.id,
        serviceDto,
        req.user!.userId,
        req.user!.role,
      );
      logger.info(`Pattern updated: ${result.id} - ${result.nameFr}`);

      res.json(ok(result.toObject(), 'Pattern updated successfully'));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(err);
    }
  };

  publish = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pattern = await this.service.publishPattern(
        req.params.id,
        req.user!.userId,
        req.user!.role,
      );
      res.json(ok(pattern.toObject(), 'Motif publié'));
    } catch (err) {
      next(err);
    }
  };

  remove = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.service.deletePattern(req.params.id, req.user!.role);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
