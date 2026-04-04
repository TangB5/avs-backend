"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("@/shared/errors/AppError");
class AuthService {
    userRepository;
    jwtSecret = process.env.JWT_SECRET;
    accessExpiry = '24h';
    refreshExpiry = '7d';
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────
    async register(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError_1.ConflictError('Email already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(dto.password, 10);
        const user = await this.userRepository.create({
            email: dto.email,
            name: dto.name,
            passwordHash,
            role: dto.role || 'VIEWER',
        });
        return this.generateAuthResponse(user);
    }
    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user || !user.passwordHash) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        const isValid = await bcryptjs_1.default.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        return this.generateAuthResponse(user);
    }
    // ─────────────────────────────────────────
    // TOKEN VALIDATION (middleware / api guard)
    // ─────────────────────────────────────────
    async validateAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch {
            throw new AppError_1.UnauthorizedError('Invalid or expired token');
        }
    }
    // ─────────────────────────────────────────
    // REFRESH
    // ─────────────────────────────────────────
    async refreshToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            const user = await this.userRepository.findById(payload.userId);
            if (!user) {
                throw new AppError_1.UnauthorizedError('User not found');
            }
            return this.generateAuthResponse(user);
        }
        catch {
            throw new AppError_1.UnauthorizedError('Invalid refresh token');
        }
    }
    // ─────────────────────────────────────────
    // CORE TOKEN GENERATION
    // ─────────────────────────────────────────
    generateAuthResponse(user) {
        const { passwordHash, ...safeUser } = user;
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, this.jwtSecret, { expiresIn: this.accessExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, this.jwtSecret, { expiresIn: this.refreshExpiry });
        return {
            user: safeUser,
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 24 * 60 * 60,
            },
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map