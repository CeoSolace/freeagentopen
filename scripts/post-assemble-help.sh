#!/usr/bin/env bash
#
# post-assemble-help.sh – display helpful tips after assembling the monorepo.
# This script is optional and may be invoked manually.  It prints out a
# short guide on installing dependencies and running the services.

cat <<'EOM'
FreeAgentsLTD monorepo has been assembled.

Next steps:

1. Move into the assembled project directory:
   cd freeagentsltd

2. Copy the environment template and populate it:
   cp .env.example .env
   # Edit .env and fill in all required values.  Use scripts/check-env.sh
   # to verify that all variables are provided.

3. Install dependencies using PNPM:
   pnpm install

4. Run both services in development mode:
   ./scripts/dev-all.sh

5. Build the project for production:
   pnpm build

6. Deploy using the provided Render configuration files:
   render-web.yaml and render-bot-worker.yaml

For more information, please read the README.md at the root of the
monorepo.  Happy hacking!
EOM