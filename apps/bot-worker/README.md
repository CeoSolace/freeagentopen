# FreeAgentsLTD Bot & Worker Service

This service powers the Discord integration and background jobs for the FreeAgentsLTD esports platform. It is responsible for verifying users through Discord, synchronising roles and bans between the website and the guild, automating support flows, and performing regular reconciliation jobs.

## Features

- **Discord Bot** using `discord.js` v14
  - Posts a persistent verification message with a button in the configured verify channel
  - Generates one‑time verification tokens and responds with links back to the website
  - Provides slash commands for support and ticket management
  - DMs users about billing, verification, bans and other status updates
- **Internal API** using Express
  - `/health` – simple health check
  - `/internal/discord/*` – endpoints to query membership status, assign roles, ban/unban users, and complete verification
  - `/internal/jobs/*` – endpoints to trigger background jobs on demand
- **Background Jobs** scheduled every 30 minutes
  - Membership reconciliation (auto‑join for consenting users)
  - Ban reconciliation between the site and the guild
  - Role reconciliation based on site roles
  - Ticket triage and notification retries
  - Cleanup of expired verification tokens

## Getting Started

1. Install dependencies:

```sh
npm install
```

2. Copy `.env.example` to `.env` and populate all required values. At minimum you need a Discord bot token, guild ID, member role ID, verify channel ID, MongoDB URI, app URL and secrets.

3. Build the TypeScript source:

```sh
npm run build
```

4. Start the service:

```sh
npm start
```

By default the bot will connect to Discord, ensure the verification message is posted, and start the HTTP server on the port defined by the `PORT` environment variable (default `3001`).

## Project Structure

- `src/index.ts` – entry point that boots the Express server, connects to MongoDB, starts the Discord bot and schedules background jobs.
- `src/config.ts` – loads and validates environment variables using `zod`.
- `src/logger.ts` – simple pino logger instance.
- `src/db.ts` – MongoDB connection helper.
- `src/models/` – minimal Mongoose models needed by the worker (user, role mapping, verification tokens, bans, tickets etc.). In the monorepo these models will be provided by the shared package.
- `src/discord/` – logic related to the Discord bot: starting the client, posting the verification message, handling button interactions and slash commands, and helpers for role and ban management.
- `src/services/` – reusable services for verification, guild membership, role sync, ban sync and ticket automation.
- `src/jobs/` – scheduled tasks for reconciliation and cleanups.
- `src/api/` – Express routes implementing the health check and internal API endpoints.

## Notes

- This service assumes that the website portion handles all user authentication and account state. The bot/worker consumes and updates this state via MongoDB and internal API calls.
- All dangerous actions (bans, role changes, token generation) are logged for audit purposes.
- Internal endpoints require either the `INTERNAL_SHARED_SECRET` or `CRON_SECRET` header to be provided. Do not expose these secrets to untrusted callers.

## License

MIT