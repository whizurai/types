# Boundary checks

Scripts and config enforcing the platform↔product seam.

## What this enforces

`@whizurai/types` is the contracts package between the WhizAI platform and
products that consume it (e.g., Guzzy World). It must:

1. **Never reference product nouns.** Words like `motif`, `beat`, `arc`,
   `vibe`, `pet`, `breed`, `cinematic`, `dramatic`, etc. belong in product
   code, not in cross-product contracts.
2. **Stay dependency-free.** Only `zod` and node builtins.

The check runs in CI on every PR. Existing violations are grandfathered
via `boundary-baseline.json`.

## Files

- `check-boundary.mjs` — the check script.
- `boundary-baseline.json` — list of grandfathered violations. **Do not
  add new entries to make a failing CI pass.** Fix the violation instead.

## Adding a new reserved word

When a new product noun gets registered as an anti-leak target (see the
[never-build registry](https://github.com/guzzyworld/guzzy-world-payload/blob/main/docs/architecture/never-build.md)),
add it to the `RESERVED_WORDS` array in `check-boundary.mjs`.

## Why a baseline exists

This check was introduced after the package already contained some
product-shaped types (`src/trends.ts`). Those entries are grandfathered
so the check can adopt without forcing an immediate refactor. They
should be cleaned up in follow-up PRs and removed from the baseline.
