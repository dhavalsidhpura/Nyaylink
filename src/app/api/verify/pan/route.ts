import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler, HttpError } from '@/lib/authz';
import { decodePan } from '@/lib/kyc';

// Format check only. `verified` stays false until a licensed PAN verification provider is wired in
// (see src/lib/kyc.ts) — the UI must not present this as an Income Tax Department confirmation.
export const POST = apiHandler(async (request: Request) => {
  const { pan } = z.object({ pan: z.string().max(20) }).parse(await request.json());
  const decoded = decodePan(pan);
  if (!decoded) throw new HttpError(400, 'Invalid PAN format (e.g. ABCDE1234F).');
  return NextResponse.json({ success: true, ...decoded, formatValid: true, verified: false });
});
