"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const logger_1 = require("./logger");
/**
 * Connect to the MongoDB instance using Mongoose. The connection is cached to
 * prevent multiple simultaneous connections being created during hot reload or
 * within the job scheduler. If the connection drops the application will exit
 * to allow the process manager to restart it.
 */
async function connectToDatabase() {
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    try {
        await mongoose_1.default.connect(config_1.env.MONGODB_URI, {
            dbName: 'freeagentsltd',
        });
        logger_1.logger.info('Connected to MongoDB');
        // Bind connection events for better diagnostics
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error({ err }, 'MongoDB connection error');
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
        });
        return mongoose_1.default;
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to connect to MongoDB');
        process.exit(1);
    }
}
