"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banSyncEnabled = exports.toSiteSyncEnabled = exports.roleSyncEnabled = exports.adminIds = exports.ownerIds = exports.env = void 0;
const zod_1 = require("zod");
/**
 * Load and validate required environment variables. The schema ensures that
 * all necessary configuration is present at runtime. Optional flags
 * default to sensible values if not provided.
 */
const envSchema = zod_1.z.object({
    DISCORD_BOT_TOKEN: zod_1.z.string(),
    DISCORD_GUILD_ID: zod_1.z.string(),
    DISCORD_MEMBER_ROLE_ID: zod_1.z.string(),
    DISCORD_VERIFY_CHANNEL_ID: zod_1.z.string(),
    APP_URL: zod_1.z.string(),
    INTERNAL_SHARED_SECRET: zod_1.z.string(),
    CRON_SECRET: zod_1.z.string(),
    MONGODB_URI: zod_1.z.string(),
    OWNER_USER_IDS: zod_1.z.string().optional().default(''),
    ADMIN_USER_IDS: zod_1.z.string().optional().default(''),
    DISCORD_ROLE_SYNC_ENABLED: zod_1.z.string().optional().default('true'),
    DISCORD_TO_SITE_SYNC: zod_1.z.string().optional().default('false'),
    DISCORD_BAN_SYNC_ENABLED: zod_1.z.string().optional().default('true'),
    TOKEN_ENCRYPTION_KEY: zod_1.z.string().optional().default('')
});
// Parse the environment using the above schema
exports.env = envSchema.parse(process.env);
// Parse lists of owner/admin IDs into arrays for easier usage
exports.ownerIds = exports.env.OWNER_USER_IDS ? exports.env.OWNER_USER_IDS.split(',').filter(Boolean) : [];
exports.adminIds = exports.env.ADMIN_USER_IDS ? exports.env.ADMIN_USER_IDS.split(',').filter(Boolean) : [];
// Booleans for feature flags
exports.roleSyncEnabled = exports.env.DISCORD_ROLE_SYNC_ENABLED !== 'false';
exports.toSiteSyncEnabled = exports.env.DISCORD_TO_SITE_SYNC === 'true';
exports.banSyncEnabled = exports.env.DISCORD_BAN_SYNC_ENABLED !== 'false';
