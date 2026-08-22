import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, source, complianceType } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Full name and phone number are required.' },
        { status: 400 }
      );
    }

    const newLead = await prisma.lead.create({
      data: {
        fullName,
        email: email || null,
        phone,
        source: source || 'Website Intake',
        complianceType: complianceType || 'General Inquiry',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead registered successfully in database.',
        leadId: newLead.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Prisma Lead Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record lead in database.' },
      { status: 500 }
    );
  }
}