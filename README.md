# FreeAgentsLTD Monorepo & Shared Infrastructure

Welcome to the **FreeAgentsLTD** monorepo!  This repository contains all of the
applications and packages that power the FreeAgentsLTD esports platform.  The
platform is built around a modular monorepo architecture so that the web
application, Discord bot/worker, and shared library can be developed and
deployed together without duplication.  This directory (the `shared‑infra` zip)
provides the root configuration for the monorepo as well as the **shared
package** used across the entire project.  It also includes templates and
scripts to assemble the final workspace after extracting the three zip
archives.

## What’s in This Repository

After you assemble the three packages, the monorepo will look like the
following:

```
freeagentsltd/
  apps/
    web/          # Next.js website (from freeagentsltd‑web.zip)
    bot‑worker/   # Discord bot & worker service (from freeagentsltd‑bot‑worker.zip)
  packages/
    shared/       # Shared constants, types, schemas and helpers
  scripts/        # Helper scripts (dev, env check, post‑assembly help)
  .env.example    # Consolidated environment variables for all services
  package.json    # Root package definition (pnpm workspaces)
  pnpm-workspace.yaml # Workspace configuration
  turbo.json      # Optional TurboRepo pipeline configuration
  render‑web.yaml # Render deployment definition for the web service
  render‑bot‑worker.yaml # Render deployment definition for the bot/worker
  README.md       # This document
  assemble.sh     # Script to create the monorepo structure
```

### Shared Package (`packages/shared`)

The **shared** package exposes canonical enumerations, type definitions,
validation schemas and small helper utilities.  It is designed to be
imported by both the website and the bot/worker to avoid duplication of
business rules.  Examples include the list of supported game sectors,
region codes, role keys, account states, verification states, ban reason
codes, and usage/billing feature keys.  Zod schemas are provided to
validate these values at runtime.  Helpers such as `hasRole` and
`isHigherRole` centralise role hierarchy logic so that there is a single
source of truth for permission checking.

### Root Scripts

The `scripts/` directory contains a few helpful utilities:

* **dev‑all.sh** – Starts both the web and bot/worker services in
  development mode concurrently.  Use this during local development when
  you want to run everything at once.
* **check‑env.sh** – Validates that all required environment variables
  are defined in your local `.env` file.  It reads the consolidated
  `.env.example` file and reports missing keys.
* **post‑assemble‑help.sh** – Displays a brief message after running
  `assemble.sh` to remind you how to install dependencies and start the
  services.

### Environment Configuration

The root `.env.example` in this package merges all of the environment
variables required by the website and bot/worker services.  It is broken
into logical sections (database, NextAuth, Discord OAuth, Stripe,
Cloudinary, bot secrets, etc.) so you can quickly see what needs to be
configured.  Copy this file to `.env` in the root of the assembled
monorepo and fill in the values before running the project.  See
`scripts/check‑env.sh` for a quick way to validate your `.env` file.

### Assemble Script

The **assemble.sh** script is provided to combine the three extracted
packages into a working monorepo.  Once you have extracted the three zip
archives (`freeagentsltd‑web.zip`, `freeagentsltd‑bot‑worker.zip` and
`freeagentsltd‑shared‑infra.zip`) into the same parent directory, run
`./assemble.sh` from within the `freeagentsltd‑shared‑infra` directory.  The
script will create a new `freeagentsltd/` folder, move the `web` and
`bot‑worker` applications into `apps/`, move the shared package into
`packages/`, and copy the root configuration files and scripts into place.
By default the script refuses to overwrite an existing `freeagentsltd/`
directory unless you pass the `--force` flag.

### Deployment Templates

We provide basic Render deployment definitions for both services.  The
`render‑web.yaml` file defines a web service that builds and runs the
Next.js application in production mode and configures a health check at
`/api/health`.  The `render‑bot‑worker.yaml` file defines a background
worker that runs the Discord bot and exposes an internal API on the
configured port with a health check at `/health`.  Adjust these files as
needed to suit your deployment environment and infrastructure.

## Local Development

1. **Assemble the Monorepo** – After unpacking all three zip archives into
   one folder, run `bash freeagentsltd‑shared‑infra/assemble.sh`.  This will
   create a `freeagentsltd/` directory with the correct structure.  The
   script copies the shared package and root configuration into the new
   monorepo.
2. **Install Dependencies** – Change into the new `freeagentsltd/`
   directory and run `pnpm install`.  The repository uses [PNPM
   workspaces](https://pnpm.io/workspaces) for dependency management.  If
   you prefer npm, you can adapt the configuration accordingly.
3. **Configure Environment** – Copy `.env.example` to `.env` in the root
   of the `freeagentsltd/` directory and populate all required values.
   Some variables (like API secrets and tokens) are critical for the
   application and bot to function properly.
4. **Run Development Servers** – Execute `scripts/dev‑all.sh` from the root
   directory to start both the website and bot/worker services.  This
   helper script simply runs the underlying `pnpm --filter` commands
   concurrently and will shut down both processes when you press
   `Ctrl+C`.

## Render Deployment

To deploy the services to [Render](https://render.com), you can use the
provided YAML definitions.  Each environment variable listed in the
`render‑web.yaml` and `render‑bot‑worker.yaml` files corresponds to an entry
in `.env.example`.  Create a Render web service and a background worker
service, import the appropriate YAML file, and set the secrets in Render’s
dashboard.  Render will handle installation and running of the services.

## Security Notes

FreeAgentsLTD handles sensitive data such as OAuth tokens, payment
information, and personal conversations.  It is critical that you:

* Never commit secrets to the repository.  Use environment variables
  instead.
* Restrict internal API endpoints to trusted callers and protect them with
  shared secrets or tokens.
* Audit role and permission logic thoroughly.  The shared package exposes
  immutable role keys and helper functions to make misuse harder.
* Always validate and sanitise user input.  Both the web and bot
  packages make heavy use of Zod to enforce schemas.

## Billing & Usage

Billing logic for FreeAgentsLTD lives primarily in the website and shared
packages.  The shared package contains enumerations for usage features
and account states.  The website implements the UI for adding payment
methods, collecting opening fees, and displaying usage dashboards.  The
bot/worker uses the same constants to send billing reminders via Discord.

## Discord Integration

The Discord bot lives in the `bot‑worker` application.  It uses the
constants and helpers from the shared package to ensure that role keys,
regions and sectors are consistent with the website.  The shared package
also defines the `RoleMapping` interface used to map site roles to
Discord role IDs.  When deploying the bot, ensure that the bot token and
guild identifiers are correctly configured in your `.env` file.

---

This project is distributed under an MIT licence.  Feel free to fork and
contribute back to the project!  If you encounter issues or have
suggestions for improvements, please open a pull request.