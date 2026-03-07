"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ticketMessageSchema = new mongoose_1.default.Schema({
    ticketId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: String, enum: ['user', 'support'], required: true },
    discordUserId: { type: String },
    content: { type: String, required: true },
}, { timestamps: true });
exports.TicketMessage = mongoose_1.default.models.TicketMessage ||
    mongoose_1.default.model('TicketMessage', ticketMessageSchema);
