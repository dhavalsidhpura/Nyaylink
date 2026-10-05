/** Reads a required environment variable and fails loudly instead of falling back to an insecure default. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Current consent text versions — bump when Terms / Privacy Policy change so users re-consent.
export const CONSENT_VERSIONS = {
  TERMS_PRIVACY: '2026-10',
  KYC_PROCESSING: '2026-10',
} as const;
