"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const router_1 = __importDefault(require("./api/router"));
const discordClient_1 = require("./discord/discordClient");
const scheduler_1 = require("./jobs/scheduler");
const logger_1 = require("./logger");
/**
 * Entry point for the FreeAgentsLTD bot and worker service. This file
 * initialises the database connection, starts the Discord bot, mounts the
 * Express API router and schedules background jobs.
 */
async function main() {
    await (0, db_1.connectToDatabase)();
    await (0, discordClient_1.startDiscord)();
    (0, scheduler_1.scheduleJobs)();
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(router_1.default);
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    app.listen(port, () => {
        logger_1.logger.info(`Bot/worker API listening on port ${port}`);
    });
}
main().catch((err) => {
    logger_1.logger.error({ err }, 'Failed to start service');
    process.exit(1);
});
