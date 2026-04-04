// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
// import { logger } from '@/shared/utils/logger';

// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// const connectionString = process.env.DATABASE_URL;
// const pool = new Pool({ connectionString });

// export const db = globalForPrisma.prisma ?? new PrismaClient({
//   adapter: new PrismaPg({ pool }),
//   log: process.env.NODE_ENV === 'development'
//     ? [{ emit: 'event', level: 'query' }, 'error', 'warn']
//     : ['error'],
// });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = db;
// }

// export async function connectDatabase(): Promise<void> {
//   await db.$connect();
//   logger.info('✔ Base de données connectée');
// }

// export async function disconnectDatabase(): Promise<void> {
//   await db.$disconnect();
//   logger.info('Base de données déconnectée');
// }
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export async function connectDatabase(): Promise<void> {
  await db.$connect();
  logger.info('✔ Base de données connectée');
}

export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
  logger.info('✔ Base de données déconnectée');
}