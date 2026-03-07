"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.hashToken = hashToken;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
/**
 * Generate a random URL‑safe token. The token length defaults to 48 bytes
 * (resulting in a 64‑character base64 string) but can be increased. Tokens
 * should be short‑lived and are used for verification flows.
 */
function generateToken(size = 48) {
    return crypto_1.default.randomBytes(size).toString('base64url');
}
/**
 * Compute a SHA‑256 HMAC of a token using an optional encryption key. This
 * function ensures that tokens stored in the database are not reversible. If
 * no `TOKEN_ENCRYPTION_KEY` is provided the HMAC defaults to SHA‑256 of the
 * token itself. Use a secure key in production.
 */
function hashToken(token) {
    const key = config_1.env.TOKEN_ENCRYPTION_KEY || '';
    if (key) {
        return crypto_1.default.createHmac('sha256', key).update(token).digest('hex');
    }
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
