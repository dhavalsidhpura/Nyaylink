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
        tradeName: 'MOBIZSPARE TECHNOLOGIES',
        legalName: 'DHAVAL KISHOR SIDHPURA',
        status: 'ACTIVE',
        stateCode,
        stateName: stateCode === '27' ? 'Maharashtra' : 'Karnataka',
        principalAddress: 'Plot 42, Charkop Industrial Estate, Kandivali West, Mumbai 400067',
        filingFrequency: 'MONTHLY (GSTR-3B)',
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