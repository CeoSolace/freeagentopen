# @freeagentsltd/shared

This package provides shared business logic for the FreeAgentsLTD platform.
It includes immutable constants for sectors, regions and roles, strongly
typed interfaces and enums, Zod schemas for runtime validation and a few
helper utilities for working with roles.  Both the website and the
Discord bot/worker import this package to ensure that all services agree on
the same canonical values.

## Installation

This package is part of the FreeAgentsLTD monorepo.  You generally do not
install it directly; instead it will be available to all workspaces via
PNPM.  If you wish to use it in a separate project you can run:

```sh
pnpm add @freeagentsltd/shared
```

## Usage

Import the constants, types and helpers you need.  For example:

```ts
import { SECTORS, type Sector, hasRole } from '@freeagentsltd/shared';

function isValidSector(value: string): value is Sector {
  return (SECTORS as readonly string[]).includes(value);
}

const userRoles: Sector[] = ['fortnite']; // etc.
```

The provided Zod schemas can be used to validate API request bodies or
environment variables:

```ts
import { sectorSchema, regionSchema } from '@freeagentsltd/shared';

const parsed = sectorSchema.parse('fortnite');
// parsed is typed as Sector
```

The helper functions include `hasRole` and `isHigherRole` for performing
role hierarchy checks in a safe and centralised way.

## License

This package is released under the MIT license.  See the root of the
repository for more information.