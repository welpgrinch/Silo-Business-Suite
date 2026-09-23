# Silo Business Suite

Private development repository based on [Ever Gauzy](https://github.com/ever-co/ever-gauzy), upstream revision `b45fc7ee855c3f36a6ece91ae641a51631f3e7dd`.

The existing application is retained, with services grouped into ERP, CRM, HRM, ATS, and PM. Shared documents, reports, integrations, and administration remain available. This is a source snapshot with a new Git history, not a claim that every upstream feature is complete or production-ready. GitHub Actions are disabled initially so inherited upstream deployment workflows cannot run until they are reviewed and configured for this repository.

## Open a Codespace

1. Open the repository on GitHub, choose **Code > Codespaces > Create codespace on main**. Use an **8-core / 32 GB** machine or larger when offered. The devcontainer requests 32 GB RAM and 64 GB storage. Check your GitHub quota and billing before creating it.
2. Wait for the container and its `postCreateCommand` to finish. It installs Node 24/Yarn 1.22.22 dependencies, prepares native modules, and generates the UI environment. This monorepo's first installation/build is large and can take considerable time.
3. Run `yarn codespaces:start` in the repository terminal.
4. Open port **4200** from the **Ports** panel. Keep it **Private**, the Codespaces default. The browser automatically reloads after UI changes. Port 3000 stays internal; API requests, uploaded files, and WebSockets are proxied through 4200.

The private development database uses upstream demo accounts, including `admin@ever.co` / `admin`. Never expose these credentials on a public port or use this development environment as production.

## Configuration and Data

- The first setup creates an ignored `.env` with new random authentication/session secrets. Existing `.env` or `.env.local` files are never overwritten.
- Windows environment files, credentials, dependencies, build output, logs, and SQLite databases are not included in this published snapshot. This Codespace starts a separate development database; no local data is silently migrated.
- SQLite is stored at `apps/api/data/gauzy.sqlite3`. Schema synchronization stays off. Normal application migrations and empty-database seeding run at API startup.
- Database files survive stopping/restarting the same Codespace, but not deleting it. Export or back up needed data before deletion.
- Email, payment, AI, and other third-party integrations require your own test configuration. No provider credentials are bundled.
- The launcher uses the original full backend and the Angular Webpack `ci` profile without source maps. The local experimental esbuild target is preserved but not used by the Codespaces launcher.
- If setup fails, read the creation log and rerun `yarn codespaces:setup` after fixing the reported cause. Do not delete the database to fix installation errors.

## Verification and Handoff

Run `yarn test:codespaces` to check forwarded URLs, environment preservation, and launch options. Run `node --test .scripts/service-navigation.test.cjs .scripts/postinstall.test.js` for the existing navigation/setup checks.

Codespaces provisioning, full API/UI startup, migrations, browser workflows, and external integrations have not yet been verified in the cloud. The repository was prepared without creating a Codespace or consuming Codespaces compute on your behalf. Continue with startup/health checks, login, service navigation, permissions, and disposable-record workflows after the first build. Do not run destructive E2E scenarios on data you want to keep.

## License and Attribution

Upstream license, copyright notices, and credits are retained in [LICENSE](LICENSE), [LICENSES.md](LICENSES.md), and [CREDITS.md](CREDITS.md). The Community Edition is AGPL-3.0; making this repository private does not remove corresponding-source obligations. Trademark rights are separate. The repository name does not imply an unrestricted white-label license.