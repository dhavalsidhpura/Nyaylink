import { z } from 'zod';
import { ConsultationMode } from '@prisma/client';

const list = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max);

export const lawyerProfileSchema = z.object({
  barCouncil: z.string().trim().min(5).max(120),
  enrollmentNo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,5}\s*\/\s*\d{1,6}\s*\/\s*\d{4}$/, 'use the format on your enrolment certificate, e.g. MAH/1234/2015'),
  enrollmentYear: z.number().int().min(1950).max(new Date().getFullYear()),
  city: z.string().trim().min(2).max(60),
  bio: z.string().trim().min(40, 'please write at least 40 characters').max(2000),
  languages: list(10).min(1),
  courts: list(10),
  practiceAreaSlugs: z.array(z.string()).min(1).max(8),
  consultationFee: z.number().min(0).max(100_000),
  consultationMinutes: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
  modes: z.array(z.nativeEnum(ConsultationMode)).min(1),
});

export type LawyerProfileInput = z.infer<typeof lawyerProfileSchema>;
