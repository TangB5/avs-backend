"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getUserById(userId) {
        const user = await this.repository.findById(userId);
        if (!user)
            throw new Error('User not found');
        return user;
    }
    async updateUser(userId, data) {
        const user = await this.repository.update(userId, data);
        return user;
    }
    async getUserStats(userId) {
        const user = await this.repository.findById(userId);
        if (!user)
            throw new Error('User not found');
        // For now, return structure - will be updated when models are available
        return {
            patternsCount: 0,
            downloadsTotal: 0,
            viewsTotal: 0,
            favoritesCount: 0,
        };
    }
    async getUserPatterns(userId, limit = 5) {
        // Placeholder - will fetch from Pattern model when available
        // For now return empty array
        return [];
    }
    async getUserActivity(userId, limit = 6) {
        // Placeholder - will fetch from Activity model when available
        // For now return empty array
        return [];
    }
    async deleteUser(userId) {
        await this.repository.delete(userId);
    }
    async verifyUser(userId) {
        return this.repository.update(userId, { verified: true });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map