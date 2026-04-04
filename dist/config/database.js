"use strict";
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
// import { logger } from '@/shared/utils/logger';
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
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
const client_1 = require("@prisma/client");
const logger_1 = require("@/shared/utils/logger");
const globalForPrisma = globalThis;
exports.db = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.db;
}
async function connectDatabase() {
    await exports.db.$connect();
    logger_1.logger.info('✔ Base de données connectée');
}
async function disconnectDatabase() {
    await exports.db.$disconnect();
    logger_1.logger.info('✔ Base de données déconnectée');
}
//# sourceMappingURL=database.js.map