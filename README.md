# React Repo Template

A starting point that captures the tooling and structural patterns shared across
our React repos. Copy this directory into a new repository, rename the package,
run `pnpm install`, and commit the generated `pnpm-lock.yaml`.

## What's here

```
.
├── .changeset/              # changesets config + release notes
│   └── config.json          # `access` defaults to "restricted" — flip to "public" to publish
├── .config/                 # every tool config lives here, not the repo root
│   ├── .nvmrc               # pinned Node version (used by CI + `nvm use`)
│   ├── .oxlintrc.json       # oxlint config
│   ├── .oxfmtrc.json        # oxfmt config
│   ├── tsconfig.json        # paths are relative to .config/ (../src, ../dist)
│   ├── vite.config.ts       # library build
│   └── vitest.config.ts     # test runner
├── .github/workflows/       # CI: quality-check, release, pr-title
├── .env                     # base defaults, COMMITTED, no secrets
├── .env.dev
├── .env.staging
├── .env.prod
├── .env.local.example       # copy to .env.local (gitignored) for secrets
├── .gitignore
├── package.json             # pnpm scripts, pinned tooling, packageManager pin
├── pnpm-workspace.yaml       # supply-chain hardening settings
└── src/
    ├── index.ts             # public entry point (build + dts read from here)
    └── test/setup.ts        # vitest setup (jest-dom matchers)
```

## 1. Tooling: pnpm + oxlint + oxfmt

- **pnpm** is the only supported package manager. The version is pinned via the
  `packageManager` field in `package.json` (`pnpm@11.8.0`), so Corepack uses the
  exact same pnpm everywhere. Node is pinned in `.config/.nvmrc`.
- **oxlint** replaces ESLint (`pnpm lint` / `pnpm lint:check`). Config is
  `.config/.oxlintrc.json`; the `correctness` category is set to `error`.
- **oxfmt** replaces Prettier (`pnpm fmt` / `pnpm fmt:check`). Config is
  `.config/.oxfmtrc.json`.

Both oxlint and oxfmt are invoked with an explicit `-c .config/...` path in the
`package.json` scripts, since they don't auto-discover configs under `.config/`.

## 2. Supply-chain attack prevention

Defenses live in two places.

**Install-time (`pnpm-workspace.yaml`):**

- `savePrefix: ""` — new deps are pinned to exact versions (no `^`/`~`), so the
  manifest records precisely what was resolved.
- `allowBuilds:` — postinstall/build scripts are blocked by default; only the
  explicitly-listed packages may run them. Add to this list only after review.
- `blockExoticSubdeps: true` — transitive deps can't be pulled from git repos or
  arbitrary tarball URLs, only the registry.
- `minimumReleaseAge: 1440` — won't install a version until it's ≥ 1 day old,
  buying time for a malicious release to be caught and unpublished.
- `trustPolicy: no-downgrade` — refuses a package whose trust level dropped
  (e.g. lost publisher provenance) vs. a previous release.
- `trustPolicyExclude` / `overrides` — escape hatches, commented out with
  guidance to document every exception.

**CI-time (`.github/workflows/`):**

- `pnpm install --frozen-lockfile` — CI fails if the lockfile would change, so it
  can never silently pull a different version than what was reviewed.
- `NPM_CONFIG_PROVENANCE: "true"` + `id-token: write` on release — packages are
  published with npm provenance so consumers can verify they were built by this
  repo's CI.
- `pr-title.yml` enforces Conventional Commit PR titles (feeds changesets).

## 3. `.config` folder

All tool configuration is relocated out of the repo root into `.config/` to keep
the top level clean. Because the files moved down one level:

- `tsconfig.json` uses `../src` and `../dist` for `rootDir`/`outDir`/`include`.
- `vite.config.ts` points `dts` at `resolve(__dirname, "tsconfig.json")`.
- `package.json` scripts pass `--config .config/...` / `-c .config/...` / `-p .config/...`.
- CI uses `node-version-file: .config/.nvmrc`.

When adding a new tool, put its config here and wire the path explicitly.

## 4. `.env.*` file layout

Two axes: **environment** (base / dev / staging / prod) and **secrecy** (shared
vs. local).

| File                 | Committed? | Contains                              |
| -------------------- | ---------- | ------------------------------------- |
| `.env`               | yes        | base defaults for all envs, no secrets |
| `.env.dev`           | yes        | dev defaults, no secrets              |
| `.env.staging`       | yes        | staging defaults, no secrets          |
| `.env.prod`          | yes        | prod defaults, no secrets             |
| `.env.local`         | **no**     | secrets shared across envs            |
| `.env.dev.local`     | **no**     | dev-only secrets                      |
| `.env.staging.local` | **no**     | staging-only secrets                  |
| `.env.prod.local`    | **no**     | prod-only secrets                     |

The `.local` files are gitignored (`.env.local`, `.env.*.local`) and never
committed. `.env.local.example` documents the pattern — copy it to `.env.local`
and fill in real values. Non-local files are committed so shared, non-secret
defaults travel with the repo.

## 5. `.gitignore`

Standard Node/JS ignore set (logs, caches, `node_modules/`, `dist`, build
outputs for the common frameworks, pnpm/yarn artifacts) plus the env rule above:
`.env.local` and `.env.*.local` are ignored while the base env files are tracked.

## Getting started in a new repo

1. Copy this directory's contents to the repo root.
2. Edit `package.json`: set `name`, `description`, dependencies.
3. `corepack enable` (uses the pinned pnpm), then `pnpm install`.
4. Commit `pnpm-lock.yaml`.
5. Build out `src/index.ts` (a stub entry and `src/test/setup.ts` are already here).
6. To publish publicly, set `.changeset/config.json` `access` to `"public"` (it
   defaults to `"restricted"`).
