# NyayLink

NyayLink is an India-focused legal and compliance service portal for founders, startups, MSMEs, business owners, and individuals. The current development work is maintained on `fix/stability`; `main` is kept protected until the owner approves a release.

## Current status

The repository contains a stabilized customer flow covering registration, login, lead capture, Indian state-aware intake, case creation, customer dashboard, case details, private document upload/download, invoice display, Razorpay test-mode integration points, and authorized staff status updates.

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
npx prisma db seed
```

The current seed contains four canonical services for safe testing. The public catalog is broader than the seed and must be reconciled before customer launch so that every advertised service has an approved database price and workflow.

Start the development server with:

```bash
npm run dev
```

Open `http://localhost:3000`. The main public journey is homepage lead capture → registration/login → service intake → server-calculated quote → test payment → dashboard/case tracking → private document upload.

## Quality checks

Run the following before pushing changes:

```bash
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
6. Complete staff case assignment, status history, audit actors, customer messages/support, invoice generation, and operational monitoring.
7. Obtain professional review and approval of privacy, terms, cancellation/refund, tax, payment, and legal-service wording for India.
8. Complete responsive accessibility testing and security review on the chosen production domain.

## Branch policy

Development changes should be made on `fix/stability` or a new feature branch. Do not push directly to `main`. Merge only after the checks above pass and the owner approves the consolidated intervention list.
