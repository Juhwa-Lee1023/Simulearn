# Draft: Stop Next/TypeScript from type-checking tmp/goose

## Requirements (confirmed)
- Build currently fails at TypeScript check because files under `tmp/goose/...` are being type-checked.
- Goal: stop Next.js/TypeScript from type checking `tmp` (and specifically `tmp/goose`) while keeping normal type checking for real source.
- Preferred levers: `tsconfig` `exclude` (and/or tightening `include`), and if needed Next.js config.
- Optional: update `.gitignore` and/or other “source scanning” settings so generated tmp files don’t get committed or picked up by tools.
- Need: step-by-step plan, file changes list, and verification steps.

## Uncertainties / Open Questions
- What exact command fails (e.g., `next build`, `next lint`, `tsc --noEmit`, `pnpm build`)?
- What are the exact TS error messages and which file paths are referenced (confirm they are under `tmp/goose/...`)?
- Do you intentionally generate TypeScript into `tmp/goose/` (should it ever be type-checked)?
- Does the repo have multiple `tsconfig*.json` (monorepo/workspaces)? Which one Next uses?
- Is `tmp/` at repo root or under `src/` / app root?

## Scope Boundaries
- INCLUDE: configuration changes to exclude generated directories from TS/Next type checking; ignore rules.
- EXCLUDE: disabling type checking globally (e.g., `typescript.ignoreBuildErrors: true`) unless explicitly requested as a temporary workaround.
