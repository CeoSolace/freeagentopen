import 'dotenv/config';
import express from 'express';
import { connectToDatabase } from './db';
import router from './api/router';
import { startDiscord } from './discord/discordClient';
import { scheduleJobs } from './jobs/scheduler';
import { logger } from './logger';
import { env } from './config';

/**
 * Entry point for the FreeAgentsLTD bot and worker service. This file
 * initialises the database connection, starts the Discord bot, mounts the
 * Express API router and schedules background jobs.
 */
async function main(): Promise<void> {
  await connectToDatabase();
  await startDiscord();
  scheduleJobs();

  const app = express();
  app.use(express.json());
  app.use(router);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  app.listen(port, () => {
    logger.info(`Bot/worker API listening on port ${port}`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start service');
  process.exit(1);
});