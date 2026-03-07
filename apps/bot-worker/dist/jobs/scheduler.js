"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleJobs = scheduleJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../logger");
const membershipService_1 = require("../services/membershipService");
const banSyncService_1 = require("../services/banSyncService");
const roleSyncService_1 = require("../services/roleSyncService");
const verifyService_1 = require("../services/verifyService");
/**
 * Schedule and run recurring background jobs. These jobs perform
 * reconciliation tasks such as membership, ban and role sync, and cleanup
 * expired verification tokens. Jobs run every 30 minutes. Additional
 * functionality can be added here as needed.
 */
function scheduleJobs() {
    // Run immediately on startup
    runAllJobs().catch((err) => logger_1.logger.error({ err }, 'Failed to run initial jobs'));
    // Schedule to run every 30 minutes on the minute
    node_cron_1.default.schedule('0,30 * * * *', async () => {
        await runAllJobs();
    });
}
async function runAllJobs() {
    logger_1.logger.info('Running scheduled background jobs');
    await membershipService_1.membershipService.reconcileMemberships().catch((err) => logger_1.logger.error({ err }, 'Membership reconciliation failed'));
    await banSyncService_1.banSyncService.reconcileBans().catch((err) => logger_1.logger.error({ err }, 'Ban reconciliation failed'));
    await roleSyncService_1.roleSyncService.syncAllUsers().catch((err) => logger_1.logger.error({ err }, 'Role sync failed'));
    await verifyService_1.verificationService.cleanupExpiredTokens().catch((err) => logger_1.logger.error({ err }, 'Token cleanup failed'));
}
