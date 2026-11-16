import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeQuote, splitGst, computeConsultationQuote, getStateStampDuty } from '../src/lib/pricing.ts';
import { MASTER_PACKAGES } from '../src/data/packages.ts';
import { MASTER_SERVICES } from '../src/data/services.ts';

describe('Pricing & GST Pure Math Engine', () => {
  test('Intra-state GST splitting splits 50/50 between CGST and SGST', () => {
    const result = splitGst(1259.82, 'MH', 'MH');
    assert.strictEqual(result.intraState, true);
    assert.strictEqual(result.cgst, 629.91);
    assert.strictEqual(result.sgst, 629.91);
    assert.strictEqual(result.igst, 0);
    assert.strictEqual(result.total, 1259.82);
  });

  test('Inter-state GST splitting allocates 100% to IGST with zero CGST/SGST', () => {
    const result = splitGst(1259.82, 'DL', 'MH');
    assert.strictEqual(result.intraState, false);
    assert.strictEqual(result.cgst, 0);
    assert.strictEqual(result.sgst, 0);
    assert.strictEqual(result.igst, 1259.82);
    assert.strictEqual(result.total, 1259.82);
  });

  test('Statutory pass-through government fee is excluded from GST computation (Pure Agent Rule 33)', () => {
    const quote = computeQuote(
      {
        professionalFee: 6999,
        govtFee: 1131, // e.g. state stamp duty + PAN/TAN
        gstRate: 18,
      },
      'MH'
    );

    // GST must be 18% of 6999 only = 1259.82
    assert.strictEqual(quote.professionalFee, 6999);
    assert.strictEqual(quote.govtFee, 1131);
    assert.strictEqual(quote.gstAmount, 1259.82);
    // Total must be 6999 + 1259.82 + 1131 = 9389.82
    assert.strictEqual(quote.total, 9389.82);
  });

  test('Consultation Quote applies GST strictly to the 10% platform facilitation fee', () => {
    const quote = computeConsultationQuote(1500, 18);
    assert.strictEqual(quote.lawyerFee, 1500);
    // 10% platform fee of 1500 = 150
    assert.strictEqual(quote.platformFee, 150);
    // 18% GST on 150 = 27
    assert.strictEqual(quote.gstAmount, 27);
    // Total = 1500 + 150 + 27 = 1677
    assert.strictEqual(quote.total, 1677);
  });

  test('State Stamp duty lookup returns valid statutory schedule', () => {
    const mh = getStateStampDuty('MH');
    assert.strictEqual(mh.baseStamp, 1000);
    assert.strictEqual(mh.amount, 1131);

    const dl = getStateStampDuty('DL');
    assert.strictEqual(dl.baseStamp, 300);
    assert.strictEqual(dl.amount, 431);
  });
});

describe('Catalog Integrity & Package Arithmetic Verification', () => {
  test('All 58 catalog services have valid positive pricing and statutory SAC codes', () => {
    assert.strictEqual(MASTER_SERVICES.length, 58);
    for (const service of MASTER_SERVICES) {
      assert.ok(service.slug.length > 0, `Service missing slug`);
      assert.ok(service.price > 0, `Service ${service.slug} has invalid price: ${service.price}`);
      assert.ok(service.sacCode.length >= 5, `Service ${service.slug} has invalid SAC code: ${service.sacCode}`);
    }
  });

  test('All 8 Founder Packages have mathematically verified totals and savings', () => {
    assert.strictEqual(MASTER_PACKAGES.length, 8);

    for (const pkg of MASTER_PACKAGES) {
      // 1. Standalone sum must equal the sum of its included services
      const calculatedStandalone = pkg.includedServices.reduce(
        (sum, item) => sum + item.standalonePrice,
        0
      );
      assert.strictEqual(
        pkg.standaloneTotal,
        calculatedStandalone,
        `Package ${pkg.slug}: standaloneTotal (${pkg.standaloneTotal}) does not match component sum (${calculatedStandalone})`
      );

      // 2. Package price must be strictly lower than standalone total
      assert.ok(
        pkg.packagePrice < pkg.standaloneTotal,
        `Package ${pkg.slug}: packagePrice must offer savings over standaloneTotal`
      );

      // 3. Savings percent must match mathematically
      const expectedSavings = Math.round(
        ((pkg.standaloneTotal - pkg.packagePrice) / pkg.standaloneTotal) * 100
      );
      assert.strictEqual(
        pkg.savingsPercent,
        expectedSavings,
        `Package ${pkg.slug}: savingsPercent (${pkg.savingsPercent}%) does not match formula (${expectedSavings}%)`
      );

      // 4. Token booking advance must be exactly ₹999
      assert.strictEqual(
        pkg.advanceToken,
        999,
        `Package ${pkg.slug}: advanceToken must be ₹999`
      );
    }
  });
});
