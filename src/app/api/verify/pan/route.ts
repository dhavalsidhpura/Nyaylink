import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pan } = await request.json();

    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid 10-digit PAN format (e.g. ABCDE1234F).' },
        { status: 400 }
      );
    }

    const cleanPan = pan.toUpperCase().trim();

    return NextResponse.json(
      {
        success: true,
        pan: cleanPan,
        formatValid: true,
        verified: false,
        status: 'LIVE_LOOKUP_NOT_CONFIGURED',
        message: 'PAN format is valid. Live verification is not enabled yet.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'PAN verification service unavailable.' },
      { status: 500 }
    );
  }
}