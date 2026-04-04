"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const security_middleware_1 = require("@/shared/middlewares/security.middleware");
const error_filter_1 = require("@/shared/filters/error.filter");
const logger_1 = require("@/shared/utils/logger");
const swagger_config_1 = require("@/shared/docs/swagger.config");
const auth_routes_1 = __importDefault(require("@/modules/auth/auth.routes"));
const culture_routes_1 = __importDefault(require("@/api/routes/culture.routes"));
const user_routes_1 = __importDefault(require("@/modules/user/user.routes"));
const artisan_routes_1 = __importDefault(require("@/modules/artisan/artisan.routes"));
const palette_routes_1 = __importDefault(require("@/modules/palette/palette.routes"));
const template_routes_1 = __importDefault(require("@/modules/template/template.routes"));
const comment_routes_1 = __importDefault(require("@/modules/comment/comment.routes"));
const activity_routes_1 = __importDefault(require("@/modules/activity/activity.routes"));
const app = (0, express_1.default)();
const API_VERSION = process.env.API_VERSION ?? 'v1';
// ── Middlewares globaux ───────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(security_middleware_1.requestId);
// NOTE : Helmet bloque swagger-ui en dev — on le désactive sur /api-docs
app.use((req, res, next) => {
    if (req.path.startsWith('/api-docs'))
        return next();
    (0, security_middleware_1.helmetMiddleware)(req, res, next);
});
app.use(security_middleware_1.corsMiddleware);
app.use(security_middleware_1.globalRateLimiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, morgan_1.default)('combined', { stream: { write: msg => logger_1.logger.http(msg.trim()) } }));
// ── Swagger UI ────────────────────────────────────────────────────────────────
const swaggerUiOptions = {
    customSiteTitle: 'AVS API Docs',
    customCss: `
    body { font-family: 'Segoe UI', sans-serif; }
    .topbar { background-color: #1D1D1B !important; padding: 8px 20px; }
    .topbar .topbar-wrapper .link { color: #C0573E !important; font-weight: 700; font-size: 1.1rem; }
    .topbar .topbar-wrapper .link::before { content: ''; }
    .swagger-ui .info .title { color: #C0573E; }
    .swagger-ui .info .description p { color: #1D1D1B; }
    .swagger-ui .opblock.opblock-get    .opblock-summary { border-color: #1D1D1B; }
    .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #C0573E; }
    .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #8B3A27; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #5C1A0A; }
    .swagger-ui .btn.authorize { background: #C0573E; border-color: #C0573E; color: #F5EBE0; }
    .swagger-ui .btn.authorize svg { fill: #F5EBE0; }
  `,
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
    },
};
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec, swaggerUiOptions));
// Endpoint pour récupérer le spec JSON brut (utile pour Postman / CI)
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_config_1.swaggerSpec);
});
// ── Routes ────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Vérification de l'état de l'API
 *     tags: [System]
 *     description: Endpoint de santé — utilisé par les health checks Docker et les load balancers.
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string,  example: ok }
 *                 service:   { type: string,  example: avs-backend }
 *                 version:   { type: string,  example: '1.0.0' }
 *                 timestamp: { type: string,  format: date-time }
 *                 uptime:    { type: number,  example: 3600.42, description: 'Secondes depuis le démarrage' }
 */
app.get(`/api/${API_VERSION}/health`, (_req, res) => {
    res.json({
        status: 'ok',
        service: 'avs-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
app.use(`/api/${API_VERSION}/auth`, auth_routes_1.default);
app.use(`/api/${API_VERSION}/patterns`, culture_routes_1.default);
app.use(`/api/${API_VERSION}/users`, user_routes_1.default);
app.use(`/api/${API_VERSION}/artisans`, artisan_routes_1.default);
app.use(`/api/${API_VERSION}/palettes`, palette_routes_1.default);
app.use(`/api/${API_VERSION}/templates`, template_routes_1.default);
app.use(`/api/${API_VERSION}/comments`, comment_routes_1.default);
app.use(`/api/${API_VERSION}/activities`, activity_routes_1.default);
// ── Handlers 404 + Error ──────────────────────────────────────────────────────
app.use(error_filter_1.notFoundHandler);
app.use(error_filter_1.errorFilter);
exports.default = app;
//# sourceMappingURL=app.js.map