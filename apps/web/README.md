# FreeAgentsLTD Website

This directory contains the Next.js website for **FreeAgentsLTD**, a sector‑based esports platform. The site is built with TypeScript, the Next.js App Router, Tailwind CSS and Mongoose. Authentication is provided exclusively via Discord OAuth through NextAuth. Stripe Elements enables in‑app billing, and Cloudinary powers signed media uploads.

## Features

- **Sector based listings:** Players create or browse “Looking For Team” (LFT) and teams create or browse “Looking For Player” (LFD) listings across supported sectors (Fortnite, Valorant, Call of Duty, R6, Rocket League and League of Legends). Regions (e.g. NA, EU, UKIE, OCE, BR, LATAM, MENA, APAC, SEA, IN, AF) can be used to filter results.
- **Mini social feed:** A global and sector feed supports posts, comments, likes, follows and reports. Moderation endpoints are included for administrative oversight.
- **Messaging:** One‑to‑one messaging with optional image attachments, unread counts and cursor pagination.
- **Contracts:** Draft, propose, sign and archive simple contracts with version history. Typed signatures are captured along with timestamp, IP hash and user‑agent.
- **Support:** A knowledge base search, ticket submission and ticket detail/timeline pages provide comprehensive customer support.
- **Billing:** Users can add a payment method via Stripe Elements. An opening fee flow with deadlines is enforced, and a billing dashboard shows usage and invoices. Redirect flows for payment methods that require additional authentication are supported.
- **Verification:** A Discord verification flow ensures users have joined the required guild and hold the correct role. Users can optionally consent to auto‑join. A Fortnite Tracker URL can be stored and validated.
- **Admin dashboard:** Site administrators and moderators have powerful tools for managing users, content, listings, messaging, contracts, billing, security/bans, roles/permissions, Discord synchronisation, background jobs, settings and audit logs.
- **Security:** All mutations are validated with Zod schemas. CSRF tokens are automatically handled by Next.js and NextAuth. Rate‑limiting, input sanitisation, secure headers, audit logging and hashed IP support hooks are provided by the server layer.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill out the required environment variables (MongoDB connection string, Discord OAuth credentials, Stripe keys, Cloudinary credentials, worker URLs, etc.).

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

- **`app/`** – Top‑level route handlers, layouts and pages using the Next.js App Router. Each route segment has its own directory (`feed`, `profile/[idOrUsername]`, `lft`, `lfd`, `messages`, `contracts`, `support`, `billing`, `verify`, `admin`, etc.). API route handlers live under `app/api/...` and follow the same segment structure.
- **`components/`** – Reusable UI components, such as buttons, cards, forms, layout elements and a global navigation bar. These components are built with Tailwind CSS and are fully mobile responsive.
- **`lib/`** – Utilities and shared server helpers, including database connection (`lib/mongoose.ts`), authentication (`lib/auth.ts`), access checks (`lib/getAccessState.ts`), role helpers and usage metering stubs.
- **`models/`** – Mongoose model definitions for all collections used by the platform (User, LFTProfile, LFDListing, Post, Comment, Follow, Conversation, Message, Contract, ContractVersion, Notification, Report, Ticket, TicketMessage, AuditLog, UserBan, IpBan, Role, RoleMapping, UsageEvent, UsageAggregate, PaymentAttempt, DiscordVerifyToken).
- **`tailwind.config.js`** – Tailwind configuration with a dark mode and primary/secondary colour palette.
- **`next.config.js`** – Next.js configuration enabling the App Router and remote image patterns for Cloudinary.
- **`tsconfig.json`** – TypeScript configuration used by the Next.js build process.

## Extending the Platform

This codebase has been designed to live in a monorepo alongside `freeagentsltd-bot-worker` and `freeagentsltd-shared-infra`. Do not duplicate shared schemas or constants here unless absolutely necessary. Where integrations with the bot or shared services are required (e.g. Discord role assignment, usage billing, job monitoring), lightweight client wrappers exist in `lib/` to forward requests.

The API layer is implemented using Next.js route handlers and Zod for request validation. When adding new endpoints, always perform server‑side authorisation checks via the helpers in `lib/getAccessState.ts` and validate inputs using Zod. See the existing route handlers in `app/api/` for examples.

## Production Considerations

This repository is only the website. It does not include the bot worker or shared infrastructure. Ensure you configure CORS, security headers, logging, monitoring and other production concerns in your deployment environment. Additionally, you must configure your Discord application, Stripe account, Cloudinary account and any background worker services before deploying.
