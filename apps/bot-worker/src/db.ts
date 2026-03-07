import mongoose from 'mongoose';
import { env } from './config';
import { logger } from './logger';

/**
 * Connect to the MongoDB instance using Mongoose. The connection is cached to
 * prevent multiple simultaneous connections being created during hot reload or
 * within the job scheduler. If the connection drops the application will exit
 * to allow the process manager to restart it.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'freeagentsltd',
    });
    logger.info('Connected to MongoDB');
    // Bind connection events for better diagnostics
    mongoose.connection.on('error', (err: any) => {
      logger.error({ err }, 'MongoDB connection error');
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    return mongoose;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}