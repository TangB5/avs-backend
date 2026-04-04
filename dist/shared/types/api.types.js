"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.ok = void 0;
// Helper réponses
const ok = (data, message = 'OK', meta) => ({ success: true, message, data, ...(meta ? { meta } : {}) });
exports.ok = ok;
const fail = (message, code = 'ERROR') => ({ success: false, message, code });
exports.fail = fail;
//# sourceMappingURL=api.types.js.map