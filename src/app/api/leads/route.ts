import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INDIAN_PHONE = /^(?:\+91|91)?[6-9]\d{9}$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 320;
const MAX_SERVICE_LENGTH = 100;
const MAX_STATE_LENGTH = 60;

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = clean(body.fullName, MAX_NAME_LENGTH);
    const email = clean(body.email, MAX_EMAIL_LENGTH).toLowerCase();
    const phone = clean(body.phone, 20).replace(/[\s()-]/g, '');
    const source = clean(body.source, 80) || 'Website Intake';
    const complianceType = clean(body.complianceType, MAX_SERVICE_LENGTH) || 'General Inquiry';
    const state = clean(body.state, MAX_STATE_LENGTH) || null;

    if (fullName.length < 2 || !phone) {
      return NextResponse.json({ success: false, error: 'Full name and mobile number are required.' }, { status: 400 });
    }

    if (!INDIAN_PHONE.test(phone)) {
      return NextResponse.json({ success: false, error: 'Enter a valid Indian mobile number.' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        fullName,
        email: email || null,
        phone,
        source,
        complianceType,
        state,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, message: 'Thanks. Our team will contact you shortly.', leadId: newLead.id }, { status: 201 });
  } catch (error) {
    console.error('Prisma Lead Error:', error);
    return NextResponse.json({ success: false, error: 'We could not save your request. Please try again.' }, { status: 500 });
  }
}
