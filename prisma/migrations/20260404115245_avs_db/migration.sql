-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'CONTRIBUTOR', 'CURATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('KENTE', 'BOGOLAN', 'ADINKRA', 'NDEBELE', 'KUBA', 'NDOP', 'WAX');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('WEST_AFRICA', 'EAST_AFRICA', 'CENTRAL_AFRICA', 'NORTH_AFRICA', 'SOUTH_AFRICA', 'DIASPORA');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('CEREMONIAL', 'DAILY', 'ROYAL', 'SPIRITUAL', 'UNIVERSAL');

-- CreateEnum
CREATE TYPE "ArtisanSpecialty" AS ENUM ('KENTE', 'BOGOLAN', 'ADINKRA', 'NDEBELE', 'KUBA', 'NDOP', 'WAX');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('HERO', 'GALLERY', 'CARD', 'FORM', 'NAVIGATION', 'FOOTER', 'LAYOUT');

-- CreateEnum
CREATE TYPE "TemplateFramework" AS ENUM ('REACT', 'NEXT_JS', 'VUE', 'SVELTE', 'ANGULAR');

-- CreateEnum
CREATE TYPE "TemplateComplexity" AS ENUM ('SIMPLE', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('PATTERN', 'ARTISAN');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'UPDATED', 'PUBLISHED', 'COMMENTED', 'REVIEWED', 'DOWNLOADED', 'FAVORITED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "emailVerified" TIMESTAMP(3),
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "specialty" TEXT,
    "avatar" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patterns" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descFr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "patternType" "PatternType" NOT NULL,
    "region" "Region" NOT NULL,
    "country" CHAR(2) NOT NULL,
    "colorPrimary" TEXT NOT NULL,
    "colorSecondary" TEXT NOT NULL,
    "colorAccent" TEXT,
    "symbolMeaning" TEXT NOT NULL,
    "symbolKeywords" TEXT[],
    "symbolUsage" "UsageType" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "svgUrl" TEXT,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artisans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "craft" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "specialties" "ArtisanSpecialty"[],
    "patternCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artisans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palettes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patternCSS" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "palettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "color_tokens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "paletteId" TEXT NOT NULL,

    CONSTRAINT "color_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "framework" "TemplateFramework" NOT NULL,
    "complexity" "TemplateComplexity" NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "type" "CommentType" NOT NULL,
    "patternId" TEXT,
    "artisanId" TEXT,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patterns_slug_key" ON "patterns"("slug");

-- CreateIndex
CREATE INDEX "patterns_slug_idx" ON "patterns"("slug");

-- CreateIndex
CREATE INDEX "patterns_patternType_idx" ON "patterns"("patternType");

-- CreateIndex
CREATE INDEX "patterns_region_idx" ON "patterns"("region");

-- CreateIndex
CREATE INDEX "patterns_isPublished_idx" ON "patterns"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "artisans_userId_key" ON "artisans"("userId");

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "templates_framework_idx" ON "templates"("framework");

-- CreateIndex
CREATE INDEX "comments_patternId_idx" ON "comments"("patternId");

-- CreateIndex
CREATE INDEX "comments_artisanId_idx" ON "comments"("artisanId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artisans" ADD CONSTRAINT "artisans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "color_tokens" ADD CONSTRAINT "color_tokens_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "palettes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "patterns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "artisans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
