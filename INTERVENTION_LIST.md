# NyayLink Intervention List

This list contains only actions that require the owner’s account access, business decision, production credentials, or professional/legal approval. Development can continue without these items.

## Required before a real-customer pilot

| Item | Owner action required | When needed |
|---|---|---|
| Hosting provider | Choose and connect Vercel + Supabase, Render/Railway, or AWS Mumbai. | Before staging deployment. |
| Billing approval | Approve paid hosting plans and monthly budget. | Before enabling paid production services. |
| Domain | Confirm the final NyayLink domain and update registrar/DNS records. | Before public launch. |
| Production secrets | Enter `DATABASE_URL`, `NEXTAUTH_SECRET`, Razorpay live/test keys, email key, and storage credentials in the host dashboard. Never send them in chat. Review the old public Git history once and rotate any value if it was ever real. | Before integrated staging/payment tests. |
| Database | Create a separate development/staging database and approve the production database region/retention plan. | Before database migration and end-to-end tests. |
| Payment account | Configure Razorpay test mode, webhook URL (`/api/payments/webhook`), webhook secret, allowed domains, refund policy, and later live-mode approval. | Before payment testing and launch. |
| Document storage | Create a private storage bucket, block public access, enable encryption/versioning, and confirm retention period. | Before any real identity/legal document is uploaded. |
| Business/legal content | Provide the final legal entity name, address, support contacts, grievance contact, refund/cancellation policy, privacy notice, terms, and service disclaimers. | Before public launch. |
| Professional network | Confirm which CA/CS/advocate/operations staff may receive cases and their role/permission mapping. | Before assigning real customers. |
| State scope | Approve the first launch states, initial service list, state fees/checklists, and who owns rule updates. | Before state-aware service launch. |
| Production approval | Review the staging test results and approve merging the development branch into `main`. | Final release gate. |

## Newly added from the current development sprint

| Item | Owner action required | When needed |
|---|---|---|
| Prisma migration | Approve and run the current migrations for intake/tax/state fields, payment events, and case workflow tables against a separate development database first. | Before testing orders, payment callbacks, or case reminders. |
| Service pricing | Confirm whether the displayed professional fee includes GST and provide the real government-fee rules by service and state. | Before charging customers. |
| Customer support | Confirm the support phone, support email, escalation SLA, and the professionals who will receive cases. | Before lead capture and case assignment. |
| Document policy | Approve how long customer documents should be retained and when they should be deleted. | Before real uploads. |
| Identity verification provider | Choose and approve a compliant PAN/GSTIN verification provider, data-processing terms, and customer consent wording. | Before enabling live verification. |
| Document review approach | Decide whether review is manual at launch or uses an approved OCR/malware-scanning provider with human escalation. | Before accepting real identity documents. |
| Notification delivery | Provide a verified sender/domain for email notifications and choose where the daily reminder scheduler will run. | Before sending real customer reminders. |

## Development work completed without owner intervention

The public journey now includes guided service recommendations, state-prefilled intake, a document-readiness checkpoint, server-confirmed estimates, payment activity events, private case activity, delivery/reminder display, a secured reminder processor, staff case operations, document review, vault metadata, and synchronization of all 45 reviewed catalog services into the database seed. The current branch tracks only `.env.example`; no `.env` file is tracked. These features remain subject to staging verification and owner-approved business rules.

## Decisions that can wait

The owner can later decide about WhatsApp/SMS provider, additional languages, annual subscription plans, analytics vendor, broader state rollout, external partner network, and a full AWS migration.

## Safety rule

No real PAN, Aadhaar, bank document, certificate, password, API key, or customer document should be sent in chat or committed to GitHub. Use the hosting provider’s secret manager and private storage controls.
