import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'This legacy checkout endpoint has been retired. Use the authenticated payment flow.',
    },
    { status: 410 }
  );
}