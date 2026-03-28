import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  console.log('🌱 Seeding AVS Backend…');
  const admin = await db.user.upsert({
    where: { email: 'admin@avs.dev' }, update: {},
    create: { email: 'admin@avs.dev', name: 'Admin AVS', role: 'ADMIN' },
  });
  await db.pattern.upsert({
    where: { slug: 'ndop-bamoum' }, update: {},
    create: {
      slug: 'ndop-bamoum', nameFr: 'Ndop Royal Bamoum', nameEn: 'Bamoum Royal Ndop',
      descFr: 'Tissu sacré tissé pour les cérémonies royales du Sultanat Bamoum.',
      descEn: 'Sacred cloth woven for royal ceremonies of the Bamoum Sultanate.',
      patternType: 'NDop', region: 'CENTRAL_AFRICA', country: 'CM',
      colorPrimary: '#0D2340', colorSecondary: '#C8A96E', colorAccent: '#F5EBE0',
      symbolMeaning: 'Royauté, spiritualité, transmission inter-générationnelle.',
      symbolKeywords: ['royauté', 'cameroun', 'bamoum', 'foumban'], symbolUsage: 'CEREMONIAL',
      isPublished: true, isFeatured: true, createdById: admin.id,
    },
  });
  console.log('✅ Seed terminé.');
}
main().catch(console.error).finally(() => void db.$disconnect());
