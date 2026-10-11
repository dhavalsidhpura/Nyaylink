import { Prisma } from '@prisma/client';

/** Prisma Decimal → number, recursively. Client components can't receive Decimal instances. */
export type Plain<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
  ? Date
  : T extends Array<infer U>
  ? Plain<U>[]
  : T extends Prisma.JsonValue
  ? T
  : T extends object
  ? { [K in keyof T]: Plain<T[K]> }
  : T;

export function plain<T>(value: T): Plain<T> {
  if (value === null || value === undefined) return value as Plain<T>;
  if (Prisma.Decimal.isDecimal(value)) return (value as unknown as Prisma.Decimal).toNumber() as Plain<T>;
  if (value instanceof Date) return value as Plain<T>;
  if (Array.isArray(value)) return value.map((v) => plain(v)) as Plain<T>;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = plain(v);
    return out as Plain<T>;
  }
  return value as Plain<T>;
}

export const num = (d: Prisma.Decimal | number | null | undefined) =>
  d === null || d === undefined ? 0 : typeof d === 'number' ? d : d.toNumber();
