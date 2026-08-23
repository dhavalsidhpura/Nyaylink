# NyayLink

NyayLink is an India-focused legal and compliance service portal for founders, startups, MSMEs, business owners, and individuals. The current development work is maintained on `fix/stability`; `main` is kept protected until the owner approves a release.

## Current status

The repository contains a stabilized customer flow covering registration, login, lead capture, guided service recommendations, Indian state-aware intake, document-readiness confirmation, case creation, customer dashboard, case details, private document upload/download, invoice display, payment activity, delivery/reminder display, Razorpay test-mode integration points, and authorized staff status updates.

The application is **not yet approved for real customers or real payments**. Before launch, the owner must provide or approve the hosting provider, production database, private object storage, Razorpay production setup, email provider, domain, legal policy text, service catalog, state-specific rules, retention policy, and support process. See [`INTERVENTION_LIST.md`](./INTERVENTION_LIST.md) for the consolidated decision list.

## Technology

The project uses Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, NextAuth credential authentication, Prisma ORM, PostgreSQL, Razorpay integration points, and Resend email integration points. It is designed for responsive mobile-first use, with server-side authorization on customer, staff, order, payment, and document routes.

## Local setup

Use Node.js 20 or newer and PostgreSQL 14 or newer. Do not use real customer information, production payment keys, or real legal documents in local development.

```bash
git clone https://github.com/dhavalsidhpura/Nyaylink.git
cd Nyaylink
git checkout fix/stability
npm install
cp .env.example .env.local
```

Edit `.env.local` with a local development database and a long random `NEXTAUTH_SECRET`. Keep `.env.local` untracked. The development upload fallback writes files outside the web root under `.private-data/uploads`; this is not a production storage solution.

Generate Prisma Client and apply migrations only to a development database:

```bash
npx prisma generate
npx prisma migrate deploy
npm run generate:service-catalog
npx prisma db seed
```

The seed synchronizes all 45 reviewed public services, their pricing entries, document checklists, and recommendation tags. Keep the generated `prisma/service-catalog.json` aligned with `src/data/services.ts` whenever the public catalog changes. Every advertised service still requires owner approval of its price, official-fee treatment, and final workflow before launch.

Start the development server with:

```bash
npm run dev
```

Open `http://localhost:3000`. The main public journey is homepage service recommender → lead capture/registration → state-aware intake → document checklist → server-calculated quote → test payment → dashboard/case tracking → private document upload → professional review → final delivery → confirmed compliance reminders.

The reminder processor is available at `POST /api/internal/reminders/process`. A host-level daily scheduler should call it with `Authorization: Bearer $REMINDER_CRON_SECRET` after email and the cron secret are configured. It fails closed when not configured and does not invent due dates; staff must create confirmed reminders first.

## Quality checks

Run the following before pushing changes:

```bash
npm run generate:service-catalog
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

The production build should be tested with a valid development `DATABASE_URL`. A placeholder URL is sufficient for Prisma Client generation, but it is not sufficient for migration, seed, or end-to-end testing.

## Environment variables

| Variable | Purpose | Required when |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Running the application against a database |
| `NEXTAUTH_SECRET` | Session signing secret | Every non-local deployment |
| `NEXTAUTH_URL` | Canonical application URL | Authentication deployment |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Server-side payment integration | Razorpay test or production payments |
| `RAZORPAY_WEBHOOK_SECRET` | Signature verification for Razorpay callbacks | Before enabling webhook delivery |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Browser checkout key identifier | Razorpay checkout UI |
| `RESEND_API_KEY` | Transactional email integration | Email sending |
| `EMAIL_FROM` | Verified sender address for customer notifications | Production email sending |
| `REMINDER_CRON_SECRET` | Secret for the scheduled reminder processor | Reminder automation |
| `PRIVATE_UPLOAD_DIR` | Development-only private disk path | Local upload fallback |

Never put a secret in source code, the public repository, browser-exposed variables, screenshots, issue comments, or chat. Use the hosting provider's encrypted environment-variable store.

## Security and production blockers

Customer APIs must scope records to the authenticated customer, while staff APIs must enforce staff roles. Document downloads use an authorization-checked route rather than raw public URLs. Payment amounts are calculated from database service pricing on the server, and the stored order amount includes the configured tax amount.

The following items must be completed before production approval:

1. Apply and verify the intake/tax/state migration on a separate development database, then perform an end-to-end test with synthetic accounts.
2. Reconcile and approve the service catalog, prices, tax treatment, government-fee handling, turnaround times, and state-specific workflows.
3. Replace local private-disk uploads with private object storage, short-lived signed URLs, file metadata/checksums, malware scanning, retention rules, and tested restore procedures.
4. Configure and test the Razorpay webhook implementation with signature validation, idempotency, reconciliation, failure, refund, and browser-close handling.
5. Remove or clearly label demo verification, AI audit, checkout, sample staff, and static catalog flows that are not connected to a real approved service.
6. Complete staff case assignment, status history, audit actors, customer messages/support, invoice generation, reminder processing monitoring, and operational monitoring.
7. Configure a verified notification sender and a daily scheduler for `/api/internal/reminders/process`, then test delivery failure and retry behavior.
8. Obtain professional review and approval of privacy, terms, cancellation/refund, tax, payment, and legal-service wording for India.
9. Complete responsive accessibility testing and security review on the chosen production domain.

## Branch policy

Development changes should be made on `fix/stability` or a new feature branch. Do not push directly to `main`. Merge only after the checks above pass and the owner approves the consolidated intervention list.
