import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { gstin } = await request.json();

    if (!gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid 15-digit GSTIN format.' },
        { status: 400 }
      );
    }

    const cleanGSTIN = gstin.toUpperCase().trim();
    const stateCode = cleanGSTIN.substring(0, 2);

    return NextResponse.json(
      {
        success: true,
        gstin: cleanGSTIN,
        formatValid: true,
        verified: false,
        status: 'LIVE_LOOKUP_NOT_CONFIGURED',
        stateCode,
        message: 'GSTIN format is valid. Live verification is not enabled yet.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'GSTIN lookup service unavailable.' },
      { status: 500 }
    );
  }
}