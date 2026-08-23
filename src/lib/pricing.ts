export const DEFAULT_GST_RATE = 0.18;

export interface OrderTotals {
  professionalFee: number;
  govtFee: number;
  taxAmount: number;
  amount: number;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateOrderTotals(professionalFee: number, govtFee = 0): OrderTotals {
  const safeProfessionalFee = roundCurrency(Math.max(0, professionalFee));
  const safeGovtFee = roundCurrency(Math.max(0, govtFee));
  const taxAmount = roundCurrency(safeProfessionalFee * DEFAULT_GST_RATE);

  return {
    professionalFee: safeProfessionalFee,
    govtFee: safeGovtFee,
    taxAmount,
    amount: roundCurrency(safeProfessionalFee + safeGovtFee + taxAmount),
  };
}
