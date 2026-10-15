# Silo Business Suite

Private development repository for the Silo Business Suite workspace and services.

The repository contains the application source, deployment assets, infrastructure templates, and workspace tooling required to run the monorepo locally or in a cloud development environment.

## Open a Codespace

1. Open the repository on GitHub and choose **Code > Codespaces > Create codespace on main**.
2. Use an **8-core / 32 GB** machine or larger when offered.
3. Wait for the container and its `postCreateCommand` to finish.
4. Run `yarn codespaces:start` in the repository terminal.
5. Open the forwarded UI port in the **Ports** panel and keep it **Private**.

## Configuration and Data

- The first setup creates an ignored `.env` with random auth and session secrets.
- Windows environment files, credentials, dependencies, build output, logs, and local databases are not bundled.
- Database files are created in the workspace for local development and are not intended for production use.
- Third-party integrations and provider credentials must be configured explicitly in your environment.

## Verification and Handoff

Run the repo’s validation scripts before sharing or resizing the environment.

## License and Attribution

See [LICENSES.md](LICENSES.md) for repository licensing guidance. Upstream attribution is retained where required by source licenses.
