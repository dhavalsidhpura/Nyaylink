import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler, HttpError } from '@/lib/authz';
import { decodeGstin } from '@/lib/kyc';

// Structural decode + checksum. Live taxpayer details (name, status, returns) require the GSTN
// public API via a GSP — not fabricated here.
export const POST = apiHandler(async (request: Request) => {
  const { gstin } = z.object({ gstin: z.string().max(20) }).parse(await request.json());
  const decoded = decodeGstin(gstin);
  if (!decoded) throw new HttpError(400, 'Invalid 15-character GSTIN format.');
  if (!decoded.checksumValid) throw new HttpError(400, 'This GSTIN fails the check-digit test — please re-check it.');
  return NextResponse.json({ success: true, ...decoded, verified: false });
});
