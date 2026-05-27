import { PrismaClient, PatternType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding patterns...');

  const patterns = [
    {
      slug: 'kente-ashanti',
      name: 'Kente Ashanti',
      nameLocal: 'Kente',
      imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kente-brand.png/320px-Kente-brand.png',
      type: PatternType.KENTE,
      cssClass: 'pattern-kente',
      era: '17ème siècle',
      license: 'CC BY 4.0',
      summary: 'Le Kente est un tissu traditionnel du peuple Ashanti du Ghana, reconnaissable à ses bandes colorées entrelacées.',
      history: 'Originaire du royaume Ashanti au Ghana, le Kente fut d\'abord réservé à la royauté. Sa création remonte au 17ème siècle selon la tradition orale.',
      technique: 'Tissage à la main sur métier à bandes étroites. Chaque bande est tissée séparément puis assemblée.',
      symbolism: 'Chaque couleur et motif a une signification précise : l\'or représente la richesse, le vert la croissance, le rouge le sacrifice.',
      ceremonial: 'Porté lors des cérémonies importantes : mariages, funérailles royales, fêtes nationales.',
      sources: ['https://en.wikipedia.org/wiki/Kente_cloth', 'https://www.metmuseum.org/art/collection/search/317870'],
      isPublished: true,
      isFeatured: true,
      origin: {
        create: {
          people: 'Ashanti',
          region: 'Afrique de l\'Ouest',
          country: 'Ghana',
          flag: '🇬🇭',
          coords: [7.9465, -1.0232],
        },
      },
      colors: {
        create: [
          { hex: '#FFD700', name: 'Or', meaning: 'Royauté, richesse et fertilité' },
          { hex: '#228B22', name: 'Vert forêt', meaning: 'Croissance, renouveau et prospérité' },
          { hex: '#DC143C', name: 'Cramoisi', meaning: 'Sacrifice politique et passion spirituelle' },
          { hex: '#000000', name: 'Noir', meaning: 'Maturité spirituelle et énergie ancestrale' },
        ],
      },
      symbols: {
        create: [
          {
            name: 'Oyokoman',
            nameFr: 'Motif de la maison royale',
            cssPreview: 'bg-yellow-500',
            imageUrl: '/symbols/oyokoman.svg',
            meaning: 'Représente la maison royale Oyoko du clan Ashanti',
            usage: 'Réservé aux chefs et à la famille royale lors des cérémonies officielles',
            sacred: true,
          },
        ],
      },
      artisanQuote: {
        create: {
          text: 'Chaque fil que je tisse raconte l\'histoire de mes ancêtres. Le Kente n\'est pas qu\'un tissu, c\'est une conversation avec le passé.',
          author: 'Kofi Mensah',
          role: 'Maître tisserand',
          country: 'Ghana',
        },
      },
    },

    {
      slug: 'bogolan-mali',
      name: 'Bogolan du Mali',
      nameLocal: 'Bògòlanfini',
      imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bogolan.jpg/320px-Bogolan.jpg',
      type: PatternType.BOGOLAN,
      cssClass: 'pattern-bogolan',
      era: '12ème siècle',
      license: 'CC BY 4.0',
      summary: 'Le Bogolan est un tissu teint à la boue fabriqué par les peuples Bamana du Mali, avec des motifs géométriques symboliques.',
      history: 'Originaire du Mali, le Bogolan (littéralement "fait de boue" en Bambara) est une technique ancestrale transmise de génération en génération.',
      technique: 'Le tissu de coton est d\'abord trempé dans une infusion de feuilles, puis des motifs sont peints avec de la boue fermentée riche en fer.',
      symbolism: 'Les motifs géométriques encodent des messages et des histoires. Chaque symbole est lié à des événements historiques ou des proverbes.',
      ceremonial: 'Traditionnellement porté par les femmes après l\'excision, puis par les chasseurs pour se protéger des esprits.',
      sources: ['https://en.wikipedia.org/wiki/Bogolanfini', 'https://africanstudies.org/bogolan'],
      isPublished: true,
      isFeatured: false,
      origin: {
        create: {
          people: 'Bamana',
          region: 'Afrique de l\'Ouest',
          country: 'Mali',
          flag: '🇲🇱',
          coords: [17.5707, -3.9962],
        },
      },
      colors: {
        create: [
          { hex: '#8B4513', name: 'Brun terre', meaning: 'La terre nourricière et les ancêtres' },
          { hex: '#F5DEB3', name: 'Beige coton', meaning: 'Pureté et origine naturelle du tissu' },
          { hex: '#000000', name: 'Noir boue', meaning: 'Protection spirituelle et force' },
        ],
      },
      symbols: {
        create: [
          {
            name: 'Sankofa',
            nameFr: 'Retour aux sources',
            cssPreview: 'bg-amber-800',
            imageUrl: '/symbols/sankofa.svg',
            meaning: 'Il faut connaître son passé pour construire son avenir',
            usage: 'Présent dans les vêtements de cérémonie et les rites de passage',
            sacred: false,
          },
        ],
      },
      artisanQuote: {
        create: {
          text: 'La boue que j\'utilise vient de la même rivière que celle de ma grand-mère. C\'est notre lien invisible avec la terre.',
          author: 'Aminata Coulibaly',
          role: 'Artisane Bogolan',
          country: 'Mali',
        },
      },
    },

    {
      slug: 'adinkra-akan',
      name: 'Adinkra Akan',
      nameLocal: 'Adinkra',
      imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Adinkra_symbols.jpg/320px-Adinkra_symbols.jpg',
      type: PatternType.ADINKRA,
      cssClass: 'pattern-adinkra',
      era: '19ème siècle',
      license: 'CC BY 4.0',
      summary: 'Les symboles Adinkra sont des pictogrammes visuels du peuple Akan du Ghana, représentant des concepts, aphorismes et proverbes.',
      history: 'Originaires du peuple Akan du Ghana et de Côte d\'Ivoire, les symboles Adinkra furent d\'abord utilisés par les rois Ashanti.',
      technique: 'Les symboles sont découpés dans des calebasses ou gravés dans du bois, puis trempés dans une teinture naturelle noire pour imprimer le tissu.',
      symbolism: 'Plus de 100 symboles existent, chacun portant une signification philosophique, morale ou spirituelle profonde.',
      ceremonial: 'Traditionnellement portés lors des funérailles (Adinkra noir), puis adoptés pour toutes les célébrations.',
      sources: ['https://en.wikipedia.org/wiki/Adinkra_symbols', 'https://adinkra.org'],
      isPublished: true,
      isFeatured: true,
      origin: {
        create: {
          people: 'Akan',
          region: 'Afrique de l\'Ouest',
          country: 'Ghana',
          flag: '🇬🇭',
          coords: [7.9465, -1.0232],
        },
      },
      colors: {
        create: [
          { hex: '#000000', name: 'Noir', meaning: 'Deuil, maturité spirituelle' },
          { hex: '#8B0000', name: 'Rouge sombre', meaning: 'Mort, sacrifice et sang ancestral' },
          { hex: '#FFFFFF', name: 'Blanc', meaning: 'Purification et joie spirituelle' },
        ],
      },
      symbols: {
        create: [
          {
            name: 'Gye Nyame',
            nameFr: 'Sauf Dieu',
            cssPreview: 'bg-black',
            imageUrl: '/symbols/gye-nyame.svg',
            meaning: 'La suprématie de Dieu sur toutes choses — le symbole Adinkra le plus populaire',
            usage: 'Omniprésent dans la culture Akan, sur les vêtements, bijoux et décorations',
            sacred: true,
          },
        ],
      },
      artisanQuote: {
        create: {
          text: 'Chaque symbole que je tamponne est une prière silencieuse. L\'Adinkra parle quand les mots ne suffisent plus.',
          author: 'Kwame Asante',
          role: 'Maître imprimeur Adinkra',
          country: 'Ghana',
        },
      },
    },
  ];

  for (const patternData of patterns) {
    // Vérifie si le pattern existe déjà
    const existing = await prisma.pattern.findUnique({
      where: { slug: patternData.slug },
    });

    if (existing) {
      // Met à jour uniquement name et imgUrl si manquants
      await prisma.pattern.update({
        where: { slug: patternData.slug },
        data: {
          name: existing.name ?? patternData.name,
          imgUrl: existing.imgUrl ?? patternData.imgUrl,
        },
      });
      console.log(`✏️  Mis à jour : ${patternData.slug}`);
    } else {
      // Crée le pattern complet
      await prisma.pattern.create({ data: patternData });
      console.log(`✅ Créé : ${patternData.slug}`);
    }
  }

  console.log('🎉 Seed terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });