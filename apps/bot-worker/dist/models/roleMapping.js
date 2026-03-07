"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleMapping = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roleMappingSchema = new mongoose_1.default.Schema({
    siteRole: { type: String, required: true, unique: true },
    discordRoleId: { type: String, required: true },
}, { timestamps: true });
exports.RoleMapping = mongoose_1.default.models.RoleMapping ||
    mongoose_1.default.model('RoleMapping', roleMappingSchema);
