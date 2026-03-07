"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordVerifyToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const discordVerifyTokenSchema = new mongoose_1.default.Schema({
    discordUserId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
exports.DiscordVerifyToken = mongoose_1.default.models.DiscordVerifyToken ||
    mongoose_1.default.model('DiscordVerifyToken', discordVerifyTokenSchema);
