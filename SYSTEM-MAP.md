# Ever Gauzy: System Map and Feature Selection

## Scope

- Source: <https://github.com/ever-co/ever-gauzy>, `develop` branch, inspected on 2026-09-20.
- Inspected revision: `b45fc7ee855c3f36a6ece91ae641a51631f3e7dd`. The current upstream includes newer features than the screenshots.
- This is the public upstream repository, not a confirmed copy of the fork shown in the screenshot. Fork-specific changes are not covered.
- The complete source is loaded in `ever-gauzy/` as a shallow checkout. Downloads are cached, but the Windows dependency installation remains incomplete. Long-path support is disabled and requires an administrator change before the normal install is retried. A running deployment has not been verified.
- This inventory describes business capabilities, not every TypeScript function or API endpoint. Source presence is not a guarantee of production readiness.
- Decision on 2026-09-20: retain all modules in one application and organize navigation into ERP, CRM, HRM, ATS, and PM. No business modules are removed.

## Architecture

The application is a TypeScript monorepo using Nx and Lerna. Its main browser application is Angular; the backend uses NestJS. Some newer plugins embed React, including AI chat and an alternative time dashboard. Desktop applications share the API and UI packages.

| Area | Responsibility |
| --- | --- |
| `apps/gauzy` | Actual browser-based business application, not the marketing website |
| `apps/api` | Backend API entry point |
| `packages/core` | Backend business modules, entities, services, authorization, and persistence |
| `packages/contracts` | Shared data contracts, permissions, and feature identifiers |
| `packages/ui-core` | Shared UI components, services, navigation, and themes |
| `packages/plugins` | Optional business features, integrations, and their UI modules |
| `packages/config`, `packages/auth`, `packages/common` | Shared configuration, authentication, and utilities |
| `apps/desktop`, `apps/desktop-timer`, `apps/desktop-api` | Desktop platform, timer, and associated API applications |
| `apps/server`, `apps/server-api` | Packaged server applications |
| `apps/mcp`, `apps/mcp-auth`, `apps/server-mcp`, `packages/mcp-server` | AI-tool/MCP service applications and shared implementation |
| `apps/agent`, `apps/worker`, `apps/cli` | Additional agent, worker, and command-line applications |
| `apps/gauzy-e2e` | End-to-end tests |
| Docker Compose, `.deploy`, `.github/workflows` | Infrastructure and deployment configuration |

The feature review uses the browser routes, backend modules, contracts, and plugins. The full tracked repository is now available locally for builds.

```text
Browser or desktop UI
	-> login, organization context, feature visibility, role permissions
	-> browser routes and UI plugins
	-> NestJS API and backend plugins
	-> business services, authorization, entities
	-> database and file storage

Optional connections:
	third-party services, AI providers, queues, analytics, desktop capture
```

SQLite, PostgreSQL, and MySQL are documented database options; the production choice must be validated against the selected modules. Redis, search services, object storage, and analytics services are optional infrastructure in documented configurations, not business modules that all have to be installed immediately.

## Unified Service Groups

All 36 groups below are retained. The five service areas are navigation groups in the same application, with shared authentication, organization context, data, and permissions. They are not five separate installations or newly separated microservices.

| Service | Responsibilities |
| --- | --- |
| ERP - Enterprise Resource Planning | Accounting, invoices, estimates, income, expenses, payments, organization administration, vendors, inventory, equipment, and operational resources |
| CRM - Customer Relationship Management | Contacts, clients, customers, leads, sales pipelines, deals, proposals, and the existing client-work/job-search plugins |
| HRM - Human Resource Management | Employees, teams, departments, employment types, time tracking, timesheets, activity, time off, appointments, levels, positions, and approvals |
| ATS - Applicant Tracking System | Candidates and recruitment destinations, including recruitment plugin children when registered |
| PM - Project Management | Projects, personal/team tasks, task dashboards, and goals/OKRs/KPIs |

Dashboards and Favorites remain shortcuts above the groups. Documents, knowledge base, tags, reports, and unknown plugin sections remain shared destinations. Workspace administration, integrations, and Settings keep their existing access points. Platform billing and provider configuration remain in Settings. Payroll remains a retained backend capability, not a newly implemented screen.

Invoice records can be reached from both ERP and CRM through their existing routes; they are not duplicate databases. Shared reports continue to cover whichever services the user is authorized to access.

The display-only transformation runs after plugin registration and feature/permission mapping. It preserves existing destination routes and quick-create actions, omits hidden entries and empty service groups, and flattens nested service destinations to match the sidebar's one-submenu layout.

Implementation: [Service menu grouping](packages/ui-core/core/src/lib/services/nav-builder/service-menu.ts), [Sidebar integration](packages/ui-core/core/src/lib/components/main-nav-menu/main-nav-menu.component.ts), [Regression tests](.scripts/service-navigation.test.cjs). Run `node --test .scripts/service-navigation.test.cjs` from the repository with Node 24 or later; this focused test does not require application dependencies.

### Verification Status

- Rechecked on 2026-09-22: 13 Node tests pass, comprising 11 service-navigation regressions and two native-install environment tests. These are focused unit tests, not end-to-end proof of the system.
- No reported editor errors in the changed navigation files.
- SQLite 3.51.2, bcrypt, and a TypeORM SQLite connection pass runtime checks on Node 24.19.0. The local SQLite file has been created and passes `quick_check`; it has no application tables yet. API startup will run the application's migrations and empty-database seeding.
- Browser environment generation succeeds with the upstream configuration script and local API/UI defaults.
- Windows long-path support was enabled by the machine owner and verified as `LongPathsEnabled = 1` after restarting on 2026-09-22. A complete frozen-lockfile installation is now being resumed; earlier targeted cache recovery was not treated as a complete installation.
- Full Angular compilation, successful API startup, application-schema initialization, and desktop/mobile browser checks remain unverified. No working application URL is claimed yet.
- Dependency versions and integrity hashes are unchanged. The temporary registry-host rewrite was restored to the original lockfile.

The fresh [local preflight](.scripts/dev-preflight.cjs) records a timestamped report under the repository's ignored `tmp/` directory. On 2026-09-22 it confirmed Node 24.19.0, SQLite 3.51.2, `LongPathsEnabled = 0`, no Yarn integrity marker, and no responding API or UI. A source-API launch did not become ready and was stopped; no overnight background completion is promised.

| Validation Gate | Current Result |
| --- | --- |
| Navigation grouping, destinations, visibility, metadata, and immutability | 11 tests passed |
| Native-install environment handling | 2 tests passed |
| SQLite runtime | In-memory query passed; existing database retained |
| Dependency installation and development/production compilation | Blocked by incomplete Windows installation |
| API startup, migrations, seed accounts, and database persistence | Not verified end to end |
| Login, logout, password recovery, roles, and tenant isolation | Requires running API; not verified |
| ERP/CRM/HRM/ATS/PM create/edit/delete workflows | Requires running application; not verified |
| Input validation, error responses, and authorization enforcement | Requires integration/security tests; not verified |
| Desktop/mobile layout, keyboard navigation, accessibility, and assets | Requires browser validation; not verified |
| Live reload, refresh/deep links, and browser console/network errors | Requires successful UI build; not verified |
| Backup/restore, load testing, concurrency, and production deployment | Not verified; must use disposable test data and an agreed target environment |
| Third-party integrations, billing, email, and AI | Require configured test credentials/services; not verified |

### Local Development

The workspace [launch tasks](.vscode/tasks.json) provide `Gauzy: Configure UI`, `Gauzy: Verify Runtime`, `Gauzy: Prepare SQLite`, `Gauzy: Live API`, and `Gauzy: Live UI`. The UI task enables live reload. The API task prepares SQLite without dropping tables.

`Gauzy: Setup Status` runs the bounded local preflight. `Gauzy: Verify Changes` runs the two existing Node test files without installing additional dependencies.

`Gauzy: Live Application` starts both services once setup is complete. On this 8 GB machine, complete the initial builds one at a time before running both watchers. Local demo credentials must never be exposed on a public interface or reused for production.

If an interrupted Windows Yarn installation leaves missing files, [the cache-repair utility](.scripts/repair-yarn-cache.cjs) restores only absent files from matching cached versions. Stop package-manager writes before running it. It does not replace a complete dependency installation or claim that missing peer dependencies are satisfied.

### Windows Prerequisite

Resolved: the machine owner enabled Windows long paths and restarted. The fresh local preflight on 2026-09-22 at 16:55 UTC verified `LongPathsEnabled = 1`, SQLite 3.51.2, and approximately 3 GB of free RAM.

A complete locked dependency installation must finish before the API/UI tasks run. One unreadable Babel cache entry was quarantined outside the cache and is being refreshed through Yarn. The existing SQLite file is preserved. Build/runtime compatibility and the actual browser display still need verification; long-path support alone does not establish application readiness.

## Retained Feature Inventory

Existing feature switches and permissions can control many visible sections. Hiding a menu is not the same as disabling its API or removing its dependencies; backend access and plugin registration must be considered separately.

Retaining a module does not bypass permissions, enable paid providers, start employee recording, or complete upstream placeholders. Those remain subject to configuration and the limitations recorded below.

Unchecked detailed items below mean their end-to-end behavior has not yet been verified in this local deployment. They no longer indicate that a feature is excluded or awaiting selection.

### Evidence Labels

- **UI + API**: browser implementation/routes and related backend code were found. Not runtime-tested.
- **Plugin / setup**: plugin or integration code exists; configuration, service credentials, desktop support, or additional infrastructure can be required.
- **API / source**: backend or package implementation exists, but a complete browser workflow was not established by this review.
- **WIP**: a placeholder or unimplemented handler was found. Selecting this means potential development work, not merely enabling a setting.

## Feature Selection Index

| ID | Module | Evidence / caveat | Scope |
| --- | --- | --- | --- |
| 01 | Dashboards | UI + API | Retained |
| 02 | Organizations and departments | UI + API; organization context is foundational | Retained |
| 03 | Users, login, and permissions | UI + API; basic access control is foundational | Retained |
| 04 | Employees and contractors | UI + API | Retained |
| 05 | Teams | UI + API | Retained |
| 06 | Recruitment and candidates | UI + API | Retained |
| 07 | Scheduling and appointments | UI + API | Retained |
| 08 | Time tracking and timesheets | UI + API; desktop is optional for basic tracking | Retained |
| 09 | Activity monitoring and recordings | Mixed UI/API/plugins; desktop and privacy decisions | Retained |
| 10 | Time off and holidays | UI + API | Retained |
| 11 | Requests and approval policies | UI + API | Retained |
| 12 | CRM contacts, clients, customers, and leads | UI + API; Visitors is WIP | Retained |
| 13 | Sales pipelines and deals | UI + API | Retained |
| 14 | Vendors | UI + API | Retained |
| 15 | Projects | Organization project screens exist; standalone page is WIP | Retained |
| 16 | Tasks and work planning | UI + API; some advanced planning is API/source | Retained |
| 17 | Goals, OKRs, and KPIs | UI + API; dedicated goal report page is WIP | Retained |
| 18 | Invoices and estimates | UI + API; recurring invoice screen is WIP | Retained |
| 19 | Income and expenses | UI + API | Retained |
| 20 | Payment records | UI + API; not a guarantee of money movement | Retained |
| 21 | Payroll | API/source; no main browser payroll route found | Retained |
| 22 | Platform subscription billing | UI + API; Stripe setup | Retained |
| 23 | Products, inventory, and warehouses | UI + API; not a verified manufacturing suite | Retained |
| 24 | Equipment and asset sharing | UI + API | Retained |
| 25 | Documents, wiki, and knowledge base | UI + API/plugins; AI and email capture need setup | Retained |
| 26 | Public pages and record sharing | Mixed UI + API/plugins | Retained |
| 27 | Reports | UI + API; general Accounting report is WIP | Retained |
| 28 | Job search, matching, and proposals | Plugins / service setup | Retained |
| 29 | External integrations | Plugins; configure providers independently | Retained |
| 30 | AI assistant and voice input | Plugins / provider setup | Retained |
| 31 | Email and communication settings | UI + API; SMS settings handler is WIP | Retained |
| 32 | Data import and export | UI + API; migration compatibility untested | Retained |
| 33 | Preferences, branding, and storage | UI + API/configuration | Retained |
| 34 | Desktop and packaged server apps | Separate applications; not launched | Retained |
| 35 | APIs, MCP, and plugin extensions | API/source; optional services need separate review | Retained |
| 36 | Collaboration, notifications, and audit records | Shared services; UI coverage varies | Retained |

## Detailed Function Checklist

### 01. Dashboards

- [ ] 01.a Accounting overview: income, expenses, and related business metrics.
- [ ] 01.b Human-resources overview and employee statistics.
- [ ] 01.c Time-tracking dashboard and activity summaries.
- [ ] 01.d Project-management and team dashboards.
- [ ] 01.e Custom dashboards and dashboard widgets.
- [ ] 01.f Organization, employee, project, team, and date filters where supported.

Source: [Dashboard routes](apps/gauzy/src/app/pages/dashboard/dashboard.routes.ts), [UI plugins](apps/gauzy/src/plugin-ui.config.ts).

### 02. Organizations and Departments

- [ ] 02.a Company/organization records and switching between organizations.
- [ ] 02.b Organization profile, logo, address, location, and business settings.
- [ ] 02.c Department records and associated employees.
- [ ] 02.d Employment types, positions, and organizational reference data.
- [ ] 02.e Organization-specific defaults, languages, and currencies.
- [ ] 02.f Tenant-level versus organization-level configuration.

Even a single-company version still needs an organization context internally. We can simplify its UI without removing the underlying tenancy model.

Source: [Organization routes](apps/gauzy/src/app/pages/organizations/organizations-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 03. Users, Login, and Permissions

- [ ] 03.a User accounts, profiles, invitations, and organization memberships.
- [ ] 03.b Email/password login, password recovery, and email verification.
- [ ] 03.c Magic/email-based login.
- [ ] 03.d Social login options: GitHub, Google, Facebook, Microsoft, LinkedIn, and Twitter/X; provider setup required.
- [ ] 03.e Roles and granular permissions for viewing and changing data.
- [ ] 03.f User and organization access management.
- [ ] 03.g OAuth client administration, access tokens, and API-key-related backend capabilities.
- [ ] 03.h Account/data deletion controls, subject to permissions and retention requirements.

Basic authentication and backend authorization are not optional in a deployed business system. Extra login providers and administration screens are selectable.

Source: [User routes](apps/gauzy/src/app/pages/users/users-routing.module.ts), [Feature identifiers](packages/contracts/src/lib/feature.model.ts), [Settings routes](apps/gauzy/src/app/pages/settings/settings.routes.ts).

### 04. Employees and Contractors

- [ ] 04.a Employee/contractor directory and profiles.
- [ ] 04.b Invitations and onboarding-related screens.
- [ ] 04.c Account details, location, social/network links, and employment details.
- [ ] 04.d Rates and compensation-related profile settings.
- [ ] 04.e Employee projects and contact assignments.
- [ ] 04.f Employee documents.
- [ ] 04.g Positions, seniority levels, employment types, and skills-related records.
- [ ] 04.h Employee settings and statistics; award-related backend records also exist.

Source: [Employee routes](apps/gauzy/src/app/pages/employees/employees-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 05. Teams

- [ ] 05.a Create and manage organization teams.
- [ ] 05.b Team membership and employee associations.
- [ ] 05.c Team-linked tasks and project work.
- [ ] 05.d Team dashboard and activity summaries.
- [ ] 05.e Team join-request backend workflow; complete browser handling needs validation.

Source: [Team routes](apps/gauzy/src/app/pages/teams/teams-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 06. Recruitment and Candidates

- [ ] 06.a Candidate records, invitations, and hiring details.
- [ ] 06.b Candidate profile, location, employment information, and rate expectations.
- [ ] 06.c Education, work experience, skills, technologies, and candidate sources.
- [ ] 06.d Candidate documents and history.
- [ ] 06.e Candidate tasks and screening-task backend capabilities.
- [ ] 06.f Interview scheduling and interview calendar.
- [ ] 06.g Interview panels/interviewers, criteria, ratings, and feedback.
- [ ] 06.h Recruitment statistics.

Source: [Candidate routes](apps/gauzy/src/app/pages/candidates/candidates-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 07. Scheduling and Appointments

- [ ] 07.a Employee schedules.
- [ ] 07.b Recurring availability and date-specific availability.
- [ ] 07.c Appointment creation and management.
- [ ] 07.d Event types and appointment-related settings.
- [ ] 07.e Appointment/employee associations and booking-related public screens.

This is appointment/availability functionality; a complete shift-roster or workforce-demand planning system was not established.

Source: [Schedule routes](apps/gauzy/src/app/pages/employees/schedules/schedule-routing.module.ts), [Availability routes](apps/gauzy/src/app/pages/employees/schedules/availability-slots/availability-slots.routing.module.ts), [Appointment routes](apps/gauzy/src/app/pages/employees/appointment/appointment-routing.module.ts).

### 08. Time Tracking and Timesheets

- [ ] 08.a Start/stop work timers and associate time with work records.
- [ ] 08.b Manual time entry and editing.
- [ ] 08.c Daily timesheets.
- [ ] 08.d Weekly timesheets.
- [ ] 08.e Calendar timesheet view and individual timesheet details.
- [ ] 08.f Timesheet review and approvals.
- [ ] 08.g Project, task, employee, and team time summaries.
- [ ] 08.h Time limits and budget-related reporting.
- [ ] 08.i Desktop timer as an additional client, independently selectable in 34.

Basic time tracking does not require selecting screenshots, camera, microphone, or other monitoring.

Source: [Timesheet routes](apps/gauzy/src/app/pages/employees/timesheet/timesheet.routes.ts), [Feature identifiers](packages/contracts/src/lib/feature.model.ts), [Repository overview](README.md).

### 09. Activity Monitoring and Recordings

- [ ] 09.a Activity/time-activity summaries and employee productivity metrics.
- [ ] 09.b Application and website usage records and reports.
- [ ] 09.c Screenshot capture support and screenshot review screens.
- [ ] 09.d Screen-video plugin and related viewing capabilities.
- [ ] 09.e Camera snapshot backend plugin (`camshot`).
- [ ] 09.f Audio capture backend plugin (`soundshot`).
- [ ] 09.g Monitoring configuration and employee notification/preferences where implemented.

These are separate choices, not a required bundle. Desktop/OS permissions and matching client support matter. Camera/audio packages being registered in the API does not prove a complete end-to-end capture workflow. Any rollout needs a legitimate business purpose, appropriate employee notice/consent, access limits, and retention rules.

Source: [Activity routes](apps/gauzy/src/app/pages/employees/activity/activity.routes.ts), [Backend plugin registrations](apps/api/src/plugins.ts), [Settings routes](apps/gauzy/src/app/pages/settings/settings.routes.ts).

### 10. Time Off and Holidays

- [ ] 10.a Time-off requests and their approval workflow.
- [ ] 10.b Time-off policies and settings.
- [ ] 10.c Leave balances and related backend records.
- [ ] 10.d Official holiday records.
- [ ] 10.e Employee leave history and status views where exposed by the time-off screens.

Country-specific statutory leave calculations have not been verified.

Source: [Time-off routes](apps/gauzy/src/app/pages/time-off/time-off.routes.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 11. Requests and Approval Policies

- [ ] 11.a General request/approval records.
- [ ] 11.b Organization approval-policy configuration.
- [ ] 11.c Employee-associated requests and approvals.
- [ ] 11.d Team-associated requests and approvals.
- [ ] 11.e Related timesheet, time-off, or equipment approval flows when those modules are selected.

This does not establish a generic visual workflow designer with arbitrary multi-step business automation.

Source: [Approval routes](apps/gauzy/src/app/pages/approvals/approvals-routing.module.ts), [Policy routes](apps/gauzy/src/app/pages/approval-policy/approval-policy-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 12. CRM Contacts, Clients, Customers, and Leads

- [ ] 12.a Client records.
- [ ] 12.b Customer records.
- [ ] 12.c Lead records.
- [ ] 12.d Contact details, addresses, and organization associations.
- [ ] 12.e Contact detail views and linked business records.
- [ ] 12.f Client-related budgets and reporting when the relevant modules are retained.
- [ ] 12.g Visitor tracking screen: **WIP**, not a ready feature.

Source: [Contact routes](apps/gauzy/src/app/pages/contacts/contacts-routing.module.ts).

### 13. Sales Pipelines and Deals

- [ ] 13.a Sales pipeline definitions.
- [ ] 13.b Pipeline stages.
- [ ] 13.c Deal records and pipeline/stage associations.
- [ ] 13.d Pipeline/deal management screens.

Source: [Sales routes](apps/gauzy/src/app/pages/pages.routes.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 14. Vendors

- [ ] 14.a Organization vendor/supplier directory.
- [ ] 14.b Vendor details and organization associations.
- [ ] 14.c Vendor selection in business workflows where supported.

Vendor records alone do not establish purchase-order, procurement, or supplier-payment automation.

Source: [Vendor routes](apps/gauzy/src/app/pages/vendors/vendors-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 15. Projects

- [ ] 15.a Create, view, and edit organization projects.
- [ ] 15.b Project membership and employee/team associations.
- [ ] 15.c Project-linked tasks and tracked time.
- [ ] 15.d Project budgeting and related reports.
- [ ] 15.e Project-specific task settings and metadata.
- [ ] 15.f Project modules, sprints, and strategic-initiative backend capabilities; detailed UI coverage needs validation.
- [ ] 15.g Project-linked integrations, if selected separately.

The implemented project-management route is under `/pages/organization/projects`. The separate `/pages/projects` route currently opens a work-in-progress module; these must not be confused.

Source: [Project routes](apps/gauzy/src/app/pages/projects/projects-routing.module.ts), [Top-level routes](apps/gauzy/src/app/pages/pages.routes.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 16. Tasks and Work Planning

- [ ] 16.a Task dashboard.
- [ ] 16.b Team task views.
- [ ] 16.c Personal task views.
- [ ] 16.d Task records, assignments, descriptions, estimates, and work associations.
- [ ] 16.e Configurable statuses, priorities, sizes, versions, and issue types.
- [ ] 16.f Linked issues and issue relationship types.
- [ ] 16.g Task views and task-specific settings.
- [ ] 16.h Daily plans, estimation, sprint/module associations, and screening-task backend functionality.
- [ ] 16.i Comments, reactions, mentions, links, and subscriptions where connected to task UI; see 36.

Advanced planning objects in the API are not a promise of a finished Gantt, resource-capacity planner, or sprint-management UI.

Source: [Task routes](apps/gauzy/src/app/pages/tasks/tasks-routing.module.ts), [Task contract](packages/contracts/src/lib/task.model.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 17. Goals, OKRs, and KPIs

- [ ] 17.a Goals/objectives.
- [ ] 17.b Key results and progress updates.
- [ ] 17.c KPI definitions and KPI templates.
- [ ] 17.d Goal and key-result templates.
- [ ] 17.e Goal time frames and general settings.
- [ ] 17.f Dedicated goal reports page: **WIP**.

Source: [Goal routes](apps/gauzy/src/app/pages/goals/goals-routing.module.ts), [Top-level routes](apps/gauzy/src/app/pages/pages.routes.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 18. Invoices and Estimates

- [ ] 18.a Create, edit, and view invoices with line items.
- [ ] 18.b Create, edit, and view estimates/quotes in the invoice module.
- [ ] 18.c Received invoices and received estimates.
- [ ] 18.d Invoice payment views and invoice/estimate history.
- [ ] 18.e Accounting templates and email-related invoice/estimate workflows.
- [ ] 18.f Recurring invoice screen: **WIP**.
- [ ] 18.g Standalone `/pages/sales/estimates` screen: **WIP**; estimates inside the invoice module have their own actual routes.

Source: [Invoice routes](apps/gauzy/src/app/pages/invoices/invoices-routing.module.ts), [Invoice contract](packages/contracts/src/lib/invoice.model.ts), [Top-level routes](apps/gauzy/src/app/pages/pages.routes.ts).

### 19. Income and Expenses

- [ ] 19.a Income records and income views.
- [ ] 19.b Expense records and expense views.
- [ ] 19.c Expense categories.
- [ ] 19.d Organization recurring expenses.
- [ ] 19.e Employee recurring expenses.
- [ ] 19.f Financial dashboard/report integration where selected.

Recurring expenses have actual routes; that does not make the separate recurring-invoices placeholder functional. A full general ledger, bank reconciliation, and statutory accounting suite were not established.

Source: [Income routes](apps/gauzy/src/app/pages/income/income-routing.module.ts), [Expense routes](apps/gauzy/src/app/pages/expenses/expenses-routing.module.ts), [Top-level routes](apps/gauzy/src/app/pages/pages.routes.ts).

### 20. Payment Records

- [ ] 20.a Payment records and payment-management screens.
- [ ] 20.b Payments associated with invoices.
- [ ] 20.c Payment reports and amounts-owed reporting.
- [ ] 20.d Currency-aware payment-related data where supported.

Recording a payment is different from collecting a card payment or sending money through a bank. A generic payment-gateway feature identifier exists, but this review did not establish a finished generic gateway-settings page. Stripe platform billing is a separate module, 22.

Source: [Payment routes](apps/gauzy/src/app/pages/payments/payments-routing.module.ts), [Feature identifiers](packages/contracts/src/lib/feature.model.ts).

### 21. Payroll

- [ ] 21.a Payroll runs with pay period, pay date, frequency, and currency.
- [ ] 21.b Earning and deduction line items.
- [ ] 21.c Draft, submission, approval, cancellation, and paid-state transitions.
- [ ] 21.d Per-employee earnings, deductions, and net summaries.
- [ ] 21.e Paid-run statistics grouped by currency.
- [ ] 21.f Separate view, edit, and approval permissions.

**API/source, not a confirmed browser module.** The inspected process operation recalculates totals and marks a run paid in the database; it does not establish actual bank disbursement. Automated tax filing, statutory deductions, country-specific compliance, and payslip delivery are not verified features.

Source: [Payroll controller](packages/core/src/lib/payroll-run/payroll-run.controller.ts), [Payroll processing service](packages/core/src/lib/payroll-run/payroll-run.service.ts).

### 22. Platform Subscription Billing

- [ ] 22.a Platform subscription/billing settings UI.
- [ ] 22.b Stripe-backed platform billing integration, when configured.

This is billing for the platform/service itself, not the customer-invoicing workflow in 18. The settings source explicitly handles deployments without a Stripe key as unavailable.

Source: [Settings routes](apps/gauzy/src/app/pages/settings/settings.routes.ts), [Backend billing registration](packages/core/src/lib/app/app.module.ts).

### 23. Products, Inventory, and Warehouses

- [ ] 23.a Product/inventory-item creation, editing, and detail views.
- [ ] 23.b Product categories and product types.
- [ ] 23.c Product variants, options, variant prices, and related settings.
- [ ] 23.d Warehouses and associated inventory records.
- [ ] 23.e Merchant records and merchant management screens.
- [ ] 23.f Product-related media/assets where connected to the product workflow.
- [ ] 23.g Product-review backend plugin; complete customer-facing review workflow not validated.

The README advertises supply-chain and production management broadly. This inspection establishes inventory-related modules, not a complete purchasing, manufacturing/MRP, point-of-sale, or logistics suite.

Source: [Inventory routes](apps/gauzy/src/app/pages/inventory/inventory-routing.module.ts), [Product contract](packages/contracts/src/lib/product.model.ts), [Backend plugins](apps/api/src/plugins.ts).

### 24. Equipment and Asset Sharing

- [ ] 24.a Equipment register and equipment management.
- [ ] 24.b Equipment sharing/booking requests.
- [ ] 24.c Equipment-sharing policies.
- [ ] 24.d Employee-associated equipment usage and approval-related records.

Source: [Equipment routes](apps/gauzy/src/app/pages/equipment/equipment-routing.module.ts), [Sharing routes](apps/gauzy/src/app/pages/equipment-sharing/equipment-sharing-routing.module.ts), [Sharing-policy routes](apps/gauzy/src/app/pages/equipment-sharing-policy/equipment-sharing-policy.routing.module.ts).

### 25. Documents, Wiki, and Knowledge Base

- [ ] 25.a Legacy organization document uploads and employee/candidate document workflows.
- [ ] 25.b Legacy help-center/knowledge-base content.
- [ ] 25.c New Documents hub with folders, pages, and uploaded files.
- [ ] 25.d Browsing, filters, categories, tags, and search-related controls.
- [ ] 25.e Uploads, file processing state, and metadata editing.
- [ ] 25.f Review queue, approve/reject controls, and bulk actions.
- [ ] 25.g Version-related APIs, record links, favorites, and sharing.
- [ ] 25.h Wiki/page authoring and editor implementation; exact editor/collaboration maturity needs runtime validation.
- [ ] 25.i Optional AI extraction/classification, embeddings, and knowledge indexing.
- [ ] 25.j Inbound-email document capture with a review step; email/domain and webhook setup required.

The newer hub is feature-gated. Legacy organization Documents and Help Center routes can redirect into it. AI processing is separately configured and documented as off by default. Plugin README milestone descriptions and newer editor code are not always aligned, so detailed editor promises are intentionally withheld.

Source: [Documents backend](packages/plugins/docs/README.md), [Documents UI](packages/plugins/docs-ui/README.md), [Legacy redirect guard](apps/gauzy/src/app/pages/feature-documents-redirect.guard.ts).

### 26. Public Pages and Record Sharing

- [ ] 26.a Organization public pages.
- [ ] 26.b Employee public pages.
- [ ] 26.c Public appointment/booking-related screens.
- [ ] 26.d Public-share and shared-entity backend capabilities.
- [ ] 26.e Document sharing through the documents plugin.

Public visibility must be decided explicitly. These capabilities are not equivalent to a fully verified customer self-service portal.

Source: [Application routes](apps/gauzy/src/app/app.routes.ts), [Repository overview](README.md), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 27. Reports

- [ ] 27.a Time and activity reports.
- [ ] 27.b Weekly time reports.
- [ ] 27.c Applications and URLs reports.
- [ ] 27.d Manual-time/edit reports.
- [ ] 27.e Expense reports.
- [ ] 27.f Payment reports.
- [ ] 27.g Amounts-owed reports.
- [ ] 27.h Daily and weekly time-limit reports.
- [ ] 27.i Project-budget reports.
- [ ] 27.j Client-budget reports.
- [ ] 27.k General Accounting report page: **WIP**.
- [ ] 27.l Dedicated Goals report page: **WIP**.

Keep only reports for modules/data you retain. Advanced analytics services mentioned in deployment documentation are additional setup, not evidence that every advertised BI report is finished.

Source: [Report route definitions](apps/gauzy/src/app/pages/pages.routes.ts).

### 28. Job Search, Matching, and Proposals

- [ ] 28.a Job-search plugin and related search UI.
- [ ] 28.b Job-matching UI.
- [ ] 28.c Job-related employee selection/settings UI.
- [ ] 28.d Proposal management.
- [ ] 28.e Reusable proposal templates.
- [ ] 28.f Upwork-related integration when selected in 29.

These are distinct from the internal candidate/ATS module. External feeds, account permissions, service configuration, and matching behavior still need end-to-end testing; a plugin registration does not establish working job acquisition by itself.

Source: [Job plugin registration](apps/gauzy/src/plugin-ui.config.ts), [Proposal routes](packages/plugins/job-proposal-ui/src/lib/proposal/job-proposal.routes.ts), [Job-search routes](packages/plugins/job-search-ui/src/lib/job-search.routes.ts).

### 29. External Integrations

Choose providers separately. The following adapters are registered in the main backend, but each adapter's complete synchronization coverage and current third-party API compatibility are untested:

- [ ] 29.a Upwork.
- [ ] 29.b Hubstaff.
- [ ] 29.c GitHub.
- [ ] 29.d Jira.
- [ ] 29.e Plane.
- [ ] 29.f Ever Async.
- [ ] 29.g Make.com.
- [ ] 29.h Zapier.
- [ ] 29.i Activepieces.
- [ ] 29.j Sim.
- [ ] 29.k Gauzy AI integration, separate from the embedded chat provider choices.
- [ ] 29.l WakaTime: source package exists, but it is not included in the inspected main backend plugin list.
- [ ] 29.m Jitsu analytics.
- [ ] 29.n PostHog analytics; configuration-gated.
- [ ] 29.o Sentry monitoring/tracing; configuration-gated.

Automation-provider adapters are not a guarantee of a built-in no-code automation builder. Analytics/monitoring providers can send operational data outside your server and should be selected intentionally.

Source: [Backend plugin list](apps/api/src/plugins.ts), [UI plugin list](apps/gauzy/src/plugin-ui.config.ts), [WakaTime package](packages/plugins/integration-wakatime/README.md).

### 30. AI Assistant and Voice Input

- [ ] 30.a Embedded streaming chat sidebar and conversation history.
- [ ] 30.b Read business data through the logged-in user's permissions.
- [ ] 30.c Approval-gated actions such as task creation, timer operations, and form submission.
- [ ] 30.d Open/read application pages and assist with forms.
- [ ] 30.e Tenant-specific provider credentials and model selection.
- [ ] 30.f Voice dictation/speech-to-text, independently configured from the chat provider.
- [ ] 30.g Local/self-hosted provider endpoints.
- [ ] 30.h Document AI functionality, separately selectable in 25.i.

Chat-capable provider packages: OpenAI, Anthropic, Gemini, Grok, Groq, Mistral, OpenRouter, Vercel AI Gateway, LocalAI, and a generic OpenAI-compatible endpoint. Voice support depends on the provider; additional voice-only packages include Deepgram, ElevenLabs, Speaches, and whisper.cpp. The registered Gauzy AI provider is documented as a chat placeholder, not a functioning chat backend.

This requires valid provider credentials or a configured local server, suitable permissions, and explicit data-sharing choices. Optional MCP attachment is separate: the plugin documentation warns about the bundled MCP service's historical service-account identity model. Keep that attachment disabled in a multi-user deployment until per-user authorization is verified.

Source: [AI chat capabilities and constraints](packages/plugins/ai-chat/README.md), [Provider registrations](apps/api/src/plugins.ts).

### 31. Email and Communication Settings

- [ ] 31.a Tenant-level and organization-level SMTP configuration.
- [ ] 31.b Email templates.
- [ ] 31.c Email history.
- [ ] 31.d Transactional email workflows for selected modules, such as invitations, account recovery, and estimates.
- [ ] 31.e Accounting templates used by relevant financial workflows.
- [ ] 31.f SMS gateway settings: **WIP**; the inspected provider-change handler is empty.

Email sending needs a configured mail service. Email history is not a full mailbox, and this review did not establish a marketing-campaign platform or working SMS delivery.

Source: [Settings routes](apps/gauzy/src/app/pages/settings/settings.routes.ts), [SMTP routes](apps/gauzy/src/app/pages/settings/custom-smtp/custom-smtp-routing.module.ts), [SMS settings implementation](apps/gauzy/src/app/pages/settings/sms-gateway/sms-gateway.component.ts).

### 32. Data Import and Export

- [ ] 32.a Data import UI and backend.
- [ ] 32.b Data export UI and backend.
- [ ] 32.c External import/export redirect flow present in the routing.
- [ ] 32.d Selected-module data migration, subject to supported formats and entity coverage.

Exact input formats, relation handling, and export completeness need a sample-data test before committing to a migration. Application export is not a substitute for tested database/file backups.

Source: [Import/export routes](apps/gauzy/src/app/pages/import-export/import-export-routing.module.ts), [Backend modules](packages/core/src/lib/app/app.module.ts).

### 33. Preferences, Branding, and Storage

- [ ] 33.a Company identity and logo-related customization.
- [ ] 33.b Themes and visual preferences.
- [ ] 33.c Languages, locales, and week-start settings.
- [ ] 33.d Currency-related and organization defaults.
- [ ] 33.e Tags/labels and reference data.
- [ ] 33.f Tenant and organization feature switches.
- [ ] 33.g File-storage configuration; local and S3-compatible deployment options are documented.
- [ ] 33.h Monitoring-related settings.
- [ ] 33.i Account/data deletion controls where appropriate.
- [ ] 33.j Preferred UI setting for supported Angular/React alternatives, not a replacement of the entire Angular application.

The inspected UI config lists English, French, Spanish, German, Portuguese, Italian, Dutch, Polish, Russian, Chinese, Arabic, Bulgarian, and Hebrew. Translation completeness has not been reviewed. Rebranding remains subject to license notices and trademark constraints; it is not an unrestricted white-label license.

Source: [Settings routes](apps/gauzy/src/app/pages/settings/settings.routes.ts), [Language/plugin configuration](apps/gauzy/src/plugin-ui.config.ts), [Licensing terms](LICENSES.md).

### 34. Desktop and Packaged Server Apps

- [ ] 34.a Browser-only deployment.
- [ ] 34.b Full desktop application for Windows, macOS, or Linux.
- [ ] 34.c Lightweight desktop timer for employees/contractors.
- [ ] 34.d Packaged Gauzy Server for a client/server deployment.
- [ ] 34.e Desktop connection to a self-hosted API instead of a hosted service.
- [ ] 34.f Local/all-in-one application configuration where supported.

These are deployment/client choices. They do not have to be built merely because their source is in the monorepo. OS-specific capture, packaging, updates, and offline behavior need separate validation if desktop clients are retained.

Source: [Server and desktop overview](README.md).

### 35. APIs, MCP, and Plugin Extensions

- [ ] 35.a Headless REST API and API documentation.
- [ ] 35.b Custom integrations using the retained business APIs.
- [ ] 35.c GraphQL configuration/source; actual coverage is not assumed equal to REST.
- [ ] 35.d Backend and UI plugin registration for extensions.
- [ ] 35.e Plugin registry/backend capabilities and web-plugin-related routes.
- [ ] 35.f MCP applications and authentication-related application packages.
- [ ] 35.g Separate agent, worker, and CLI applications where needed.

The MCP/agent/worker/CLI areas are inventoried from the tracked repository structure, not audited tool by tool or executed. They are optional scope, not prerequisites for a basic browser ERP. Background workers/queues should be selected only for retained features that need them.

Source: [API configuration](apps/api/src/plugin.config.ts), [Plugin registrations](apps/api/src/plugins.ts), [Web-plugin routes](apps/gauzy/src/app/pages/integrations/web-plugin.routes.ts), and tracked application tree at the recorded revision.

### 36. Collaboration, Notifications, and Audit Records

- [ ] 36.a Comments and mentions.
- [ ] 36.b Reactions and favorites.
- [ ] 36.c Entity subscriptions/watch-related backend capabilities.
- [ ] 36.d Resource links, shared entities, and public-share records.
- [ ] 36.e Employee notifications and notification settings.
- [ ] 36.f Activity logs and API-call logs.
- [ ] 36.g Broadcast/event-related services and recent-visit records.

These are cross-cutting services, not necessarily seven independent finished screens. UI exposure and retention depend on the selected modules. Their existence does not establish a full team messenger or a compliance-certified audit trail.

Source: [Backend module registration](packages/core/src/lib/app/app.module.ts).

## Known Gaps and Selection Warnings

| Item | What the inspected source establishes |
| --- | --- |
| Recurring invoices | Invoice `recurring` route loads `WorkInProgressModule` |
| Standalone Projects | `/pages/projects` is WIP; organization project routes are separate and implemented |
| Standalone Sales Estimates | `/pages/sales/estimates` is WIP; estimates inside invoices have real routes |
| Contact Visitors | Visitors route loads `WorkInProgressModule` |
| Goals Reports | Goal reports route loads `WorkInProgressModule` |
| General Accounting Report | Accounting report route loads `WorkInProgressModule` |
| SMS gateway | Settings component exists, but the provider-change handler is empty |
| Generic payment gateway | Feature flag alone does not establish a usable payment processing workflow |
| Payroll | Registered backend API; process marks database records paid, not verified bank transfers or tax compliance |
| WakaTime | Package exists, but not in the inspected main API plugin registrations |
| AI provider named Gauzy AI | Registered provider is documented as not chat-capable |
| AI-to-MCP attachment | Upstream documentation contains a per-user authorization warning; review before enabling |
| Production / supply chain | Broad README claim; full manufacturing/procurement implementation not established |
| Integrations and desktop capture | Source presence does not verify third-party credentials, API compatibility, or OS capture behavior |

## Dependencies That Affect Our Choices

| Selected feature | Minimum related concepts that normally remain |
| --- | --- |
| Any deployed application | Users, authentication, authorization, tenant/organization context, database, required shared UI |
| Employee timesheets | Employees; optional project/task associations; approval permissions if reviewing time |
| Monitoring | Employees, time/activity data, compatible desktop capture client, storage and retention controls |
| Project/task workflows | Organizations, users/employees, selected team/contact associations |
| Invoices/estimates | Organization details, contacts, line items, currencies; email/storage if used |
| Financial reports | The corresponding income, expense, invoice, payment, or time data |
| Payroll API | Employees, organization/currency context, payroll permissions; additional UI work if required |
| Equipment sharing | Equipment, employees, policies, and relevant approvals |
| Document AI | Documents, storage, provider configuration and explicit knowledge-processing controls |
| External integration | Only its adapter and the local entities it synchronizes; separate external account/setup |

Dependencies are a planning guide, not a generated dependency graph. Removing source packages comes after validating the selected workflow, not before.

## Implementation Order

1. Retain all upstream modules and apply the unified service-group navigation.
2. Install dependencies and validate the grouping against existing routes, permissions, and plugins.
3. Build and run the browser/API application locally, then check navigation on desktop and mobile.
4. Configure organization details, branding, user roles, and the required external service connections.
5. Address retained WIP/API-only features separately where a complete user-facing workflow is required.

No integrations are silently given credentials, no employee recording is enabled by this navigation change, and no upstream licensing obligations are removed.

## Source Anchors

- [Application routes](apps/gauzy/src/app/pages/pages.routes.ts)
- [Feature identifiers](packages/contracts/src/lib/feature.model.ts)
- [UI plugin configuration](apps/gauzy/src/plugin-ui.config.ts)
- [Backend application module](packages/core/src/lib/app/app.module.ts)
- [Repository overview](README.md)
- [Licensing terms](LICENSES.md)

## Licensing Constraint

The community edition uses AGPL-3.0, with any additional component-specific terms still requiring review. Modified versions offered over a network have corresponding-source obligations to their users. Keeping modifications proprietary requires checking the commercial licensing option. Trademark rights are separate from source-code licensing. This is a planning constraint, not legal advice.