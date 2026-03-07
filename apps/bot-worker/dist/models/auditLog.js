"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLogSchema = new mongoose_1.default.Schema({
    actorId: { type: String },
    action: { type: String, required: true },
    targetId: { type: String },
    data: { type: mongoose_1.default.Schema.Types.Mixed },
}, { timestamps: true });
exports.AuditLog = mongoose_1.default.models.AuditLog || mongoose_1.default.model('AuditLog', auditLogSchema);
