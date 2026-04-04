"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
class ActivityService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async getUserActivity(userId, params) {
        const skip = (params.page - 1) * params.perPage;
        const [items, total] = await Promise.all([
            this.repository.findByUser(userId, { skip, take: params.perPage }),
            this.repository.countByUser(userId),
        ]);
        return {
            items,
            meta: {
                page: params.page,
                perPage: params.perPage,
                total,
            },
        };
    }
    async logActivity(userId, action, targetId, targetType, metadata) {
        return this.repository.create({
            userId,
            action,
            targetId,
            targetType,
            metadata,
        });
    }
    async getGlobalStats() {
        return this.repository.getGlobalStats();
    }
}
exports.ActivityService = ActivityService;
//# sourceMappingURL=activity.service.js.map