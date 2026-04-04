"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("@/config/database");
const logger_1 = require("@/shared/utils/logger");
const PORT = parseInt(process.env.PORT ?? '4000', 10);
async function bootstrap() {
    try {
        await (0, database_1.connectDatabase)();
        const server = app_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 AVS Backend démarré — http://localhost:${PORT}`);
            logger_1.logger.info(`📚 Swagger UI : http://localhost:${PORT}/api-docs`);
            logger_1.logger.info(`📋 Health     : http://localhost:${PORT}/api/v1/health`);
            logger_1.logger.info(`🌍 Environnement : ${process.env.NODE_ENV ?? 'development'}`);
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.warn(`Signal ${signal} reçu — arrêt gracieux…`);
            server.close(async () => {
                await (0, database_1.disconnectDatabase)();
                logger_1.logger.info('Serveur arrêté proprement');
                process.exit(0);
            });
            setTimeout(() => { logger_1.logger.error('Arrêt forcé après timeout'); process.exit(1); }, 10_000);
        };
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));
        process.on('uncaughtException', err => { logger_1.logger.error('uncaughtException', err); process.exit(1); });
        process.on('unhandledRejection', err => { logger_1.logger.error('unhandledRejection', err); });
    }
    catch (err) {
        logger_1.logger.error('Échec du démarrage', err);
        process.exit(1);
    }
}
void bootstrap();
//# sourceMappingURL=server.js.map