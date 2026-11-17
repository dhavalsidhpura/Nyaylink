import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeQuote, splitGst, computeConsultationQuote, getStateStampDuty, getStateJurisdiction, checkStateSchemeEligibility } from '../src/lib/pricing.ts';
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

  test('Unverified state code cannot drive GST calculation', () => {
    assert.throws(
      () => splitGst(1259.82, 'UNKNOWN', 'MH'),
      /Place of supply is unverified/
    );
    assert.throws(
      () => splitGst(1259.82, null as any, 'MH'),
      /Place of supply is unverified/
    );
  });

  test('Unverified state code cannot drive stamp duty or fee decisions', () => {
    const unknown = getStateStampDuty('UNKNOWN');
    assert.strictEqual(unknown.isVerified, false);
    assert.strictEqual(unknown.amount, 0);
    assert.match(unknown.breakdown, /State is UNKNOWN\/unverified/);
  });
  test('Plausible unverified and invalid state codes strictly blocked across GST, Stamp Duty, Jurisdiction, and Eligibility', () => {
    const unverifiedInputs = ['UNKNOWN', 'UNVERIFIED', 'XX', '99', 'ZZ', '', null, undefined];

    for (const input of unverifiedInputs) {
      // 1. GST Calculation Blocked
      assert.throws(
        () => splitGst(1259.82, input as any, 'MH'),
        /Place of supply is unverified/i,
        `GST split must be strictly rejected for input: ${input}`
      );

      // 2. Stamp Duty Calculation Blocked
      const stamp = getStateStampDuty(input as any);
      assert.strictEqual(stamp.isVerified, false, `Stamp duty must be unverified for ${input}`);
      assert.strictEqual(stamp.amount, 0, `Stamp duty amount must be 0 for ${input}`);
      assert.match(stamp.breakdown, /UNKNOWN|unverified/i);

      // 3. Jurisdiction Assignment Blocked
      const jurisdiction = getStateJurisdiction(input as any);
      assert.strictEqual(jurisdiction.isVerified, false, `Jurisdiction must be unverified for ${input}`);
      assert.strictEqual(jurisdiction.roc, null);
      assert.strictEqual(jurisdiction.ncltBench, null);
      assert.strictEqual(jurisdiction.gstJurisdiction, null);
      assert.match(jurisdiction.reason || '', /rejected|unverified|UNKNOWN/i);

      // 4. Scheme Eligibility Blocked
      const eligibility = checkStateSchemeEligibility(input as any, 'STARTUP_SUBSIDY');
      assert.strictEqual(eligibility.isVerified, false, `Eligibility must be unverified for ${input}`);
      assert.strictEqual(eligibility.eligible, false);
      assert.match(eligibility.reason, /not evaluated|professional review|blocked|unverified/i);
    }
  });

  test('Jurisdiction helper returns verified mapping ONLY for maintained gazette records, and unverified/requires review for unmaintained states', () => {
    // 1. Maintained states with complete gazette source citations return VERIFIED_MAINTAINED
    const maintainedStates = ['MH', 'DL', 'KA'];
    for (const code of maintainedStates) {
      const jur = getStateJurisdiction(code);
      assert.strictEqual(jur.isVerified, true);
      assert.strictEqual(jur.status, 'VERIFIED_MAINTAINED');
      assert.ok(jur.roc && jur.roc.length > 0);
      assert.ok(jur.ncltBench && jur.ncltBench.length > 0);
      assert.ok(jur.gstJurisdiction && jur.gstJurisdiction.length > 0);
      assert.ok(jur.statutorySource && jur.statutorySource.length > 0);
      assert.ok(jur.effectiveDate && jur.effectiveDate.length > 0);
    }

    // 2. Verified Indian states without complete maintained gazette mapping return UNVERIFIED_REQUIRES_REVIEW (zero generic fallbacks)
    const unmaintainedStates = ['GJ', 'TN', 'WB', 'TS', 'GA'];
    for (const code of unmaintainedStates) {
      const jur = getStateJurisdiction(code);
      assert.strictEqual(jur.isVerified, false, `State ${code} must not have generic fallback jurisdiction`);
      assert.strictEqual(jur.status, 'UNVERIFIED_REQUIRES_REVIEW');
      assert.strictEqual(jur.roc, null);
      assert.strictEqual(jur.ncltBench, null);
      assert.strictEqual(jur.gstJurisdiction, null);
      assert.match(jur.reason, /requires review|no complete.*mapping/i);
    }
  });

  test('checkStateSchemeEligibility() strictly returns not evaluated / professional review required and NEVER returns eligible: true solely for verified state', () => {
    const statesToTest = ['MH', 'KA', 'DL', 'GJ', 'UNKNOWN', 'XX'];

    for (const code of statesToTest) {
      const result = checkStateSchemeEligibility(code, 'STARTUP_SUBSIDY');
      assert.strictEqual(result.isVerified, false, `Eligibility must be unverified for ${code}`);
      assert.strictEqual(result.eligible, false, `Eligibility must never be true without entity-specific legal audit`);
      assert.strictEqual(result.status, 'NOT_EVALUATED_PROFESSIONAL_REVIEW_REQUIRED');
      assert.match(result.reason, /not evaluated/i);
      assert.match(result.reason, /professional review required/i);
    }
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
