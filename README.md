# Silo Business Suite

One business application organized into **ERP, CRM, HRM, ATS, and PM**.

This repository contains the Silo Business Suite workspace, application code, deployment guidance, and supporting automation.

Start with [CODESPACES.md](CODESPACES.md) for the Linux/Node 24 cloud workspace, 32 GB memory requirement, private preview, and `yarn codespaces:start`.

See [SYSTEM-MAP.md](SYSTEM-MAP.md) for the service inventory and current limitations. GitHub Actions are initially disabled to avoid inherited automation and keep the project environment controlled.

## What is included

- ERP
- CRM
- HRM
- ATS
- PM
- Shared business operations and productivity tooling

## Getting started

- Use the workspace tooling and package scripts defined in the repository for local and cloud development.
- Configure deployment settings and infrastructure files in the repository-specific directories for your environment.

## Development

The application is designed for a single business-suite workspace with backend and frontend services, plus deployment and supporting automation files.

## Deployment

Use the repository's deployment manifests and environment config as the starting point for local or cloud deployment. Adjust secrets and environment variables before exposing the application outside a private or controlled environment.

## Security

Keep client-to-server traffic behind HTTPS/WSS, rotate secrets regularly, and ensure sensitive environment values are not committed to source control.

## Contributing

Open issues or pull requests for changes, improvements, and bug fixes. Keep the product name and documentation aligned with Silo Business Suite wherever user-facing text appears.
