import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const INDIAN_PHONE = /^(?:\+91|91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 100);
    const email = clean(body.email, 320).toLowerCase();
    const phone = clean(body.phone, 20).replace(/[\s()-]/g, '');
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2 || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, mobile number, and password are required.' }, { status: 400 });
    }

    if (!EMAIL.test(email)) {
      return NextResponse.json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (!INDIAN_PHONE.test(phone)) {
      return NextResponse.json({ success: false, error: 'Enter a valid Indian mobile number.' }, { status: 400 });
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ success: false, error: 'Password must be between 8 and 128 characters.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: 'CLIENT' },
      select: { id: true },
    });

    return NextResponse.json({ success: true, message: 'Account created successfully.', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ success: false, error: 'We could not create the account. Please try again.' }, { status: 500 });
  }
}
