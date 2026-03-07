import cron from 'node-cron';
import { logger } from '../logger';
import { membershipService } from '../services/membershipService';
import { banSyncService } from '../services/banSyncService';
import { roleSyncService } from '../services/roleSyncService';
import { verificationService } from '../services/verifyService';

/**
 * Schedule and run recurring background jobs. These jobs perform
 * reconciliation tasks such as membership, ban and role sync, and cleanup
 * expired verification tokens. Jobs run every 30 minutes. Additional
 * functionality can be added here as needed.
 */
export function scheduleJobs(): void {
  // Run immediately on startup
  runAllJobs().catch((err) => logger.error({ err }, 'Failed to run initial jobs'));
  // Schedule to run every 30 minutes on the minute
  cron.schedule('0,30 * * * *', async () => {
    await runAllJobs();
  });
}

async function runAllJobs(): Promise<void> {
  logger.info('Running scheduled background jobs');
  await membershipService.reconcileMemberships().catch((err) => logger.error({ err }, 'Membership reconciliation failed'));
  await banSyncService.reconcileBans().catch((err) => logger.error({ err }, 'Ban reconciliation failed'));
  await roleSyncService.syncAllUsers().catch((err) => logger.error({ err }, 'Role sync failed'));
  await verificationService.cleanupExpiredTokens().catch((err) => logger.error({ err }, 'Token cleanup failed'));
}