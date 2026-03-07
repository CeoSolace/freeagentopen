"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBan = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userBanSchema = new mongoose_1.default.Schema({
    discordUserId: { type: String, required: true, index: true },
    reason: { type: String, default: 'Violation of rules' },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    source: { type: String, enum: ['site', 'discord'], required: true },
}, { timestamps: true });
exports.UserBan = mongoose_1.default.models.UserBan || mongoose_1.default.model('UserBan', userBanSchema);
