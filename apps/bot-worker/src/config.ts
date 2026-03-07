import { z } from 'zod';

/**
 * Load and validate required environment variables. The schema ensures that
 * all necessary configuration is present at runtime. Optional flags
 * default to sensible values if not provided.
 */
const envSchema = z.object({
  DISCORD_BOT_TOKEN: z.string(),
  DISCORD_GUILD_ID: z.string(),
  DISCORD_MEMBER_ROLE_ID: z.string(),
  DISCORD_VERIFY_CHANNEL_ID: z.string(),
  APP_URL: z.string(),
  INTERNAL_SHARED_SECRET: z.string(),
  CRON_SECRET: z.string(),
  MONGODB_URI: z.string(),
  OWNER_USER_IDS: z.string().optional().default(''),
  ADMIN_USER_IDS: z.string().optional().default(''),
  DISCORD_ROLE_SYNC_ENABLED: z.string().optional().default('true'),
  DISCORD_TO_SITE_SYNC: z.string().optional().default('false'),
  DISCORD_BAN_SYNC_ENABLED: z.string().optional().default('true'),
  TOKEN_ENCRYPTION_KEY: z.string().optional().default('')
});

// Parse the environment using the above schema
export const env = envSchema.parse(process.env);

// Parse lists of owner/admin IDs into arrays for easier usage
export const ownerIds: string[] = env.OWNER_USER_IDS ? env.OWNER_USER_IDS.split(',').filter(Boolean) : [];
export const adminIds: string[] = env.ADMIN_USER_IDS ? env.ADMIN_USER_IDS.split(',').filter(Boolean) : [];

// Booleans for feature flags
export const roleSyncEnabled = env.DISCORD_ROLE_SYNC_ENABLED !== 'false';
export const toSiteSyncEnabled = env.DISCORD_TO_SITE_SYNC === 'true';
export const banSyncEnabled = env.DISCORD_BAN_SYNC_ENABLED !== 'false';