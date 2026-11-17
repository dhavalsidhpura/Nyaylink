import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MASTER_PACKAGES } from '../src/data/packages';

describe('Customer-Facing Bundle Prices Immutability Assertions', () => {
  const EXPECTED_INVARIANT_PRICES: Record<string, { packagePrice: number; advanceToken: number }> = {
    'startup-launchpad-bundle': { packagePrice: 8999, advanceToken: 999 },
    'tech-founder-venture-suite': { packagePrice: 14999, advanceToken: 999 },
    'restaurant-kitchen-compliance-kit': { packagePrice: 6499, advanceToken: 999 },
    'ecommerce-seller-suite': { packagePrice: 5999, advanceToken: 999 },
    'retailer-physical-storefront-pack': { packagePrice: 4499, advanceToken: 999 },
    'annual-corporate-compliance-retainer': { packagePrice: 19999, advanceToken: 999 },
    'global-vc-delaware-crossborder-suite': { packagePrice: 28999, advanceToken: 999 },
    'brand-fortress-ipr-protection-suite': { packagePrice: 7999, advanceToken: 999 },
  };

  it('Asserts exactly 8 customer-facing packages are defined', () => {
    assert.equal(MASTER_PACKAGES.length, 8);
  });

  for (const pkg of MASTER_PACKAGES) {
    it(`Asserts ${pkg.slug} checkout price (₹${pkg.packagePrice}) and advance token (₹${pkg.advanceToken}) remain strictly unchanged`, () => {
      const expected = EXPECTED_INVARIANT_PRICES[pkg.slug];
      assert.ok(expected, `Package ${pkg.slug} was not found in expected invariant price register.`);

      // Strict price immutability check
      assert.equal(
        pkg.packagePrice,
        expected.packagePrice,
        `Customer-facing package price for ${pkg.slug} has drifted! Expected ${expected.packagePrice}, got ${pkg.packagePrice}`
      );

      // Strict advance booking token immutability check
      assert.equal(
        pkg.advanceToken,
        expected.advanceToken,
        `Customer-facing advance token for ${pkg.slug} has drifted! Expected ${expected.advanceToken}, got ${pkg.advanceToken}`
      );
    });

    it(`Asserts ${pkg.slug} component-sum and customer savings calculate dynamically without altering bundle price`, () => {
      const computedSum = pkg.includedServices.reduce((sum, s) => sum + s.standalonePrice, 0);

      // Verify component sum matches computed standaloneTotal
      assert.equal(
        pkg.standaloneTotal,
        computedSum,
        `standaloneTotal does not equal sum of includedServices for ${pkg.slug}`
      );

      // Verify bundle price is lower than standalone total (positive founder savings)
      assert.ok(
        pkg.standaloneTotal > pkg.packagePrice,
        `Package ${pkg.slug} does not offer customer savings! standaloneTotal=${pkg.standaloneTotal}, packagePrice=${pkg.packagePrice}`
      );

      // Verify mathematical savings formula
      const expectedSavings = Math.max(0, Math.round(((computedSum - pkg.packagePrice) / computedSum) * 100));
      assert.equal(
        pkg.savingsPercent,
        expectedSavings,
        `savingsPercent formula drift on ${pkg.slug}`
      );
    });
  }
});
