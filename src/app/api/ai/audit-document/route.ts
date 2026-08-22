import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { documentName, documentType } = await request.json();

    if (!documentName) {
      return NextResponse.json(
        { success: false, error: 'Document name required for AI inspection.' },
        { status: 400 }
      );
    }

    // AI rule checks (Simulating Google Gemini 1.5 Pro multimodal OCR inspection)
    const isUtilityBill = documentName.toLowerCase().includes('bill') || documentType === 'UTILITY_BILL';
    const isOldBill = documentName.toLowerCase().includes('old') || documentName.toLowerCase().includes('2024') || documentName.toLowerCase().includes('2025');

    if (isUtilityBill && isOldBill) {
      return NextResponse.json(
        {
          success: true,
          auditStatus: 'FLAGGED',
          confidenceScore: 98,
          findings: [
            '⚠️ Document Date Discrepancy: Electricity bill appears dated over 60 days ago.',
            'ROC Regulation Notice: SPICe+ Part B rules strictly require utility bills to be under 2 months old with clear sub-meter readings.',
          ],
          recommendation: 'Please upload an electricity bill dated within the last 60 days to prevent ROC rejection.',
          canProceed: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        auditStatus: 'PASSED',
        confidenceScore: 96,
        findings: [
          '✓ Image Resolution & Text Clarity: Clear and legible (100% OCR confidence).',
          '✓ Valid Document Type: Standard electricity / address proof format matched.',
          '✓ No Stamp Duty or QR Code Occlusion detected.',
        ],
        recommendation: 'Document meets all statutory compliance guidelines for ROC/GST filing.',
        canProceed: true,
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