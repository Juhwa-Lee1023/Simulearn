# Tailwind v4 build errors — restrict scanning / exclude tmp fixtures

## TL;DR

Tailwind v4 is likely extracting candidates from **non-app source** (notably `tmp/tailwindcss/**` fixtures) and surfacing them as “invalid utilities” during the build. The fix is to **constrain Tailwind’s source scanning to real app files** (and explicitly exclude `tmp/**`, `node_modules/**`, `.next/**`, etc.). Separately, the `Module not found: Can't resolve '${x}' in app/globals.css` error indicates an **actual CSS import/URL string interpolation** somewhere in the CSS import chain; we need to locate and remove/replace it so Next’s CSS bundler stops trying to resolve a literal `${x}` path.

Deliverables:
- A Tailwind v4 scanning configuration that **only scans `app/`, `src/`, and `components/`** (or your chosen “real source” dirs) and **excludes `tmp/**`**.
- A verified root-cause and fix for **"Can't resolve '${x}'"**.
- A repository hygiene update so `tmp/` (fixtures) cannot affect builds (ignore/exclude patterns).

Estimated effort: **Short**
Parallel execution: **YES (2 waves)**
Critical path: Identify scan inputs → constrain scanning → rebuild → confirm errors resolved

---

## Context (repo facts observed)

- Next.js app with App Router.
- Tailwind v4 present (`tailwindcss` ~4.1.x) via PostCSS plugin `@tailwindcss/postcss`.
- `app/globals.css` includes `@import "tailwindcss";` and Tailwind v4 directives like `@theme inline`.
- No `tailwind.config.*` found in repo root.
- `tmp/` exists locally and contains Tailwind’s own source + test fixtures (e.g. `tmp/tailwindcss/packages/tailwindcss/src/*test.ts`) and other content; these files include the same strings seen in your failing candidates (e.g. `@media_not`, `max-[theme(spacing.4/50)]`, `max-w-[var(--breakpoint-sm)]`).
- `.gitignore` already lists `tmp/`, but that **does not prevent build tools from reading it**.

---

## Work Objectives

### Core objective
Make Tailwind v4 and Next build stable by ensuring Tailwind’s candidate extraction only sees real app source files, and by removing any CSS import/URL that causes Next to attempt to resolve a literal `${x}` path.

### Scope
IN:
- Tailwind scanning/source config changes (primary fix)
- Excluding `tmp/**` from being considered by Tailwind and/or the build
- Fixing the `${x}` module resolution error

OUT:
- Refactoring Tailwind utilities or rewriting app UI
- Migrating away from Tailwind v4
- Deleting `tmp/` contents (unless you explicitly choose that)

---

## Verification Strategy

Automated (agent-executable):
- `npm run build` → must succeed
- `npm run dev` → must start without Tailwind “invalid utility” errors

Optional diagnostics to capture evidence:
- Grep for `${x}` in CSS/JS sources (excluding `.next/`, `node_modules/`)
- Tailwind debug logs (if enabled) showing scanned sources

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (in parallel):
1) Identify Tailwind scanning mode and how to configure “content” / sources for v4 in this repo
2) Locate the *actual* `${x}` import/URL causing Next’s module resolution error

Wave 2 (after Wave 1):
3) Implement scanning restriction/exclusions (choose the least invasive mechanism that works)
4) Fix/remove the `${x}` import/URL and confirm rebuild

Critical path: (1,2) → (3,4) → build verification

---

## TODOs

### 1) Confirm Tailwind v4 scanning mechanism currently in use

**What to do**:
- Determine whether Tailwind v4 is using:
  - **Automatic content detection** (no config) and is scanning too broadly, OR
  - A hidden/implicit config file (nonstandard location), OR
  - Any build-time tooling that provides content paths.
- Enumerate “real source roots” that should be scanned:
  - Usually `app/**/*.{js,ts,jsx,tsx,mdx}` and/or `src/**/*.{...}`.

**References**:
- `postcss.config.mjs` — confirms Tailwind v4 PostCSS plugin usage.
- `package.json` — confirms Tailwind v4 dependencies.

**Acceptance criteria**:
- A written list of directories/extensions that Tailwind must scan (explicitly excluding `tmp/**`).

---

### 2) Locate the real source of `Can't resolve '${x}'` (CSS import chain)

**What to do**:
- Identify which CSS line actually triggers the error. Even if the error mentions `app/globals.css`, it may be:
  - An `@import` inside another CSS file imported by `globals.css`, or
  - A `url(${x})` / `@import "${x}"` string inside CSS generated/concatenated by tooling.
- Search for patterns in *source* directories (exclude `.next/`, `node_modules/`, `tmp/`):
  - `@import "${` / `@import '${` / `url(${` / literal `${x}`.

**Guardrail**:
- Do not “fix” this by adding a resolver alias for `${x}`—that just masks the true issue.

**Acceptance criteria**:
- The exact file path + line with the offending `${x}` is identified.

---

### 3) Add explicit Tailwind scanning config that excludes tmp/

**Primary remediation path (recommended)**:
- Add a `tailwind.config.{js,ts}` in repo root with explicit `content` globs that include only real app sources, e.g.:
  - `./app/**/*.{js,ts,jsx,tsx,mdx}`
  - `./src/**/*.{js,ts,jsx,tsx,mdx}` (if present)
  - `./components/**/*.{js,ts,jsx,tsx}` (if present)
- Ensure the globs do **not** include `tmp/**`.

**Alternate remediation path (if v4 prefers CSS-first config in your setup)**:
- Use Tailwind v4 “source directives” (if available in your installed v4 version) to explicitly set the scanning roots from CSS, e.g. via `@source` directives in `app/globals.css`.

**Hard requirements**:
- Exclude at least:
  - `tmp/**`
  - `.next/**`
  - `node_modules/**`

**Acceptance criteria**:
- Tailwind no longer emits errors referencing candidates from `tmp/tailwindcss/**` files.

---

### 4) Make tmp/ non-participating in builds (belt-and-suspenders)

**What to do**:
- Confirm whether Next/webpack is walking `tmp/` (it shouldn’t, but accidental imports can pull it in).
- Add/adjust ignore/exclude mechanisms so `tmp/` cannot be bundled even if someone imports it accidentally:
  - Keep `.gitignore` as-is.
  - Consider adding build-time excludes in `next.config.ts` (webpack exclude rule) only if necessary.

**Acceptance criteria**:
- No build step reads `tmp/` as a source of Tailwind candidates.
- If accidental imports exist, they are caught/blocked or removed.

---

### 5) Fix the `${x}` error at the source

**What to do**:
- Once the offending line is found, fix by one of:
  - Replacing template-literal-like placeholder with a literal URL/path
  - Removing the import/URL entirely
  - If it’s intended to be runtime-variable, move it out of CSS into JS styling logic that Next supports.

**Acceptance criteria**:
- `npm run build` succeeds with no `Can't resolve '${x}'`.

---

### 6) Regression check + documentation

**What to do**:
- Run `npm run build` and `npm run dev`.
- Record what directories Tailwind scans and why `tmp/` is excluded.

**Acceptance criteria**:
- Build passes.
- A short note exists (README or comment in Tailwind config) explaining why `tmp/` is excluded.

---

## File changes likely

- `tailwind.config.ts` (or `.js`) — add explicit `content` globs (recommended)
- `app/globals.css` — only if using Tailwind v4 `@source` directives or to remove problematic imports
- `next.config.ts` — optional, only if you need a hard exclude for `tmp/`
- `.gitignore` — likely no change (already ignores `tmp/`), but may add `tmp/**` variants if needed

---

## Known open items (must be resolved during execution)

- Confirm the exact line/source responsible for `Can't resolve '${x}'` (it is not visible in current `app/globals.css`).
- Confirm the best Tailwind v4 mechanism in your exact version/setup:
  - `tailwind.config.*` with `content` vs CSS `@source` directives.
