# Silo Business Suite

This repository contains the Silo Business Suite application code, deployment assets, and supporting infrastructure.

## Overview

Silo Business Suite provides the core business operations platform in a monorepo layout, with frontend, API, integrations, deployment configuration, and workspace tooling.

Silo is an integrated platform that bundles ERP (Enterprise Resource Planning), CRM (Customer Relationship Management), HRM (Human Resource Management), ATS (Applicant Tracking System), and PM (Project Management) into a single cohesive suite — enabling operations, sales, HR, hiring, and project delivery to work together.

## Getting started

- Review the repository root docs and deployment files before building or deploying.
- Use the workspace scripts and environment files to configure local or cloud development settings.
- Keep secrets and production credentials out of source control.

## Project layout

- `apps/` — application code and web clients
- `packages/` — shared libraries, configuration, and integrations
- `.deploy/` — deployment templates and runtime configuration
- `.github/` — repository automation and workflow configuration

## License

See [LICENSES.md](LICENSES.md) for repository licensing details.
