# NyayLink release test plan

This plan is for a separate development or staging environment only. Never use real PAN, Aadhaar, bank documents, customer documents, live payment credentials, or production customer data while executing it.

## 1. Automated checks

Run the following from the project root:

```bash
npm run generate:service-catalog
npx prisma generate
npx prisma validate
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Confirm that the catalog generator reports 45 unique services and that the production build lists the public, customer, staff, payment, document, and reminder routes.

## 2. Database preparation

Create a separate development database. Apply every migration, then seed it:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Confirm that the database contains 45 active services, 45 pricing entries, document checklists, and recommendation tags. Confirm that the following migrations are recorded: intake/tax/state fields, payment events, case workflow foundation, and vault metadata.

## 3. Customer journey

Use a synthetic Indian customer account and a synthetic staff account. Do not commit credentials.

1. Open the homepage on a narrow mobile viewport and a desktop viewport.
2. Use the guided recommender with at least three goals and Maharashtra, Gujarat, and another state. Confirm the suggested service and state-prefilled intake link.
3. Submit a lead with a valid Indian mobile number and confirm that invalid email, mobile, and oversized input are rejected.
4. Register and sign in. Confirm that weak passwords, invalid email, non-Indian mobile formats, duplicate email, and duplicate phone are rejected safely.
5. Open at least one service from each major category. Confirm the required documents, state guidance, provisional/server quote, GST line, official-fee note, and document-readiness confirmation are visible before payment.
6. Attempt to continue to payment without accepting the document-readiness confirmation. Confirm it is blocked.
7. Create an order in Razorpay test mode. Confirm the amount comes from database pricing, includes the configured tax calculation, and cannot be changed by the browser.
8. Close the browser before payment verification, reopen the case, and retry. Confirm the stored Razorpay order can be reconciled safely.
9. Confirm the customer dashboard shows case status, latest activity, document count, reminder count, and payment/invoice information.
10. Upload valid synthetic PDF, JPG, and PNG files. Confirm a file with the wrong signature, wrong MIME type, zero bytes, or more than 10 MB is rejected.
11. Confirm the uploaded file has no public URL, is downloadable only by the owner or authorized staff, and records file size, MIME type, checksum, and review status.
12. Submit a customer question from the case page. Confirm the message is limited in length, belongs to the correct case, and appears in the activity stream.
13. Confirm a customer cannot view another customer’s order, document, case event, invoice, or message by changing IDs or order numbers.

## 4. Staff journey

1. Confirm a client cannot access `/admin`, admin APIs, or staff case pages.
2. Open a case as an authorized staff user. Confirm only least-privilege customer and document fields are loaded.
3. Assign an allowed operations, CA/CS lead, or compliance executive user. Confirm the customer sees the assignment and a timeline event.
4. Try assigning a client, finance-only user, unknown user, or arbitrary ID. Confirm rejection.
5. Change case status through submitted, in progress, query raised, and approved. Confirm each change creates a timeline event and approved records completion time.
6. Review a document as pending, verified, and rejected. Confirm rejection requires a reason and the customer sees the resulting event.
7. Send a staff message and confirm it appears only in the matching customer case.
8. Publish a ready output. Mark it delivered only with a verified case document. Confirm the customer can download it through the authorized route.
9. Add a future reminder using a professionally confirmed date. Confirm past or invalid dates are rejected.

## 5. Payment and webhook failure tests

Use Razorpay test mode only.

| Scenario | Expected result |
|---|---|
| Invalid webhook signature | 400 or 401; no payment state change |
| Missing webhook secret | Webhook fails closed; no state change |
| Same event delivered twice | One payment event and one state transition |
| Wrong amount or currency | Event rejected; order remains unpaid |
| Captured payment | Order becomes paid and timeline records confirmation |
| Failed payment | Failure is recorded; order remains retryable |
| Refund event | Refund state/event is recorded without accepting an unrelated order |
| Browser closes after checkout | Webhook or later verification can reconcile the stored Razorpay order |

## 6. Reminder and email tests

Configure a non-production sender and a separate scheduler secret only in staging.

1. Call `POST /api/internal/reminders/process` without a secret. Confirm HTTP 503.
2. Call it with an invalid bearer secret. Confirm HTTP 401.
3. Create a due synthetic reminder and run the processor with the correct secret. Confirm one email is sent and the reminder becomes sent.
4. Deliver the same scheduled run again. Confirm no duplicate email is sent.
5. Make the email provider fail. Confirm the reminder remains pending for retry.
6. Confirm reminder titles and customer names are safely escaped in HTML.

## 7. Security and privacy review

Confirm production uses HTTPS, a strong `NEXTAUTH_SECRET`, secure cookies, a private storage bucket, short-lived signed URLs or an equivalent private adapter, malware scanning, retention/deletion controls, database backups, error monitoring, rate limiting, and a verified email sender. Confirm no secrets, real documents, passwords, or personal records are present in Git history, logs, screenshots, or public responses.

## 8. Release gate

Do not merge to `main` until the automated suite, database migration test, complete customer journey, staff journey, payment failure matrix, document authorization checks, reminder checks, accessibility review, and owner intervention list are approved. The first real-customer pilot must use approved service/state scope, test-mode payment verification followed by explicit live-mode approval, private storage, final legal text, and a support escalation process.
