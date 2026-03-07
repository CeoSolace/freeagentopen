"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    discordId: { type: String, required: true, unique: true },
    roles: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    memberRoleAssigned: { type: Boolean, default: false },
    autoJoinConsent: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpiresAt: { type: Date },
}, { timestamps: true });
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
