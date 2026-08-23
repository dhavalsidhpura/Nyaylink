import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName } = await request.json();

    if (!documentName) {
      return NextResponse.json(
        { success: false, error: 'Document name required for AI inspection.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        auditStatus: 'NOT_CONFIGURED',
        verified: false,
        findings: [],
        recommendation: 'Automated document review is not enabled. A staff member must review the uploaded document before filing.',
        canProceed: false,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'AI Document Pre-Auditor service unavailable.' },
      { status: 500 }
    );
  }
}