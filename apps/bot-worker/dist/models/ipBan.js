"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpBan = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ipBanSchema = new mongoose_1.default.Schema({
    ipHash: { type: String, required: true, unique: true },
    reason: { type: String, default: 'Violation of rules' },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
}, { timestamps: true });
exports.IpBan = mongoose_1.default.models.IpBan || mongoose_1.default.model('IpBan', ipBanSchema);
