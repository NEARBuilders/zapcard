/**
 * End-to-end tests for Bitrefill browser automation
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { BitrefillBrowser } from "../../src/sdk/browser";
import { CardDenomination, PaymentMethod } from "../../src/sdk/api/types";

describe("Bitrefill Browser Automation", () => {
  let browser: BitrefillBrowser;

  beforeAll(() => {
    // Create browser instance with headless mode disabled for debugging
    browser = new BitrefillBrowser({
      headless: false,
      timeout: 60000,
    });
  });

  afterAll(async () => {
    // Close browser after tests
    await browser.close();
  });

  test("should navigate to Bitrefill and get deposit address for $50 Visa gift card", async () => {
    // Initialize browser
    await browser.initialize();

    // Navigate to $50 Visa gift card
    await browser.navigateToProduct(CardDenomination.VISA_50);

    // Select Base USDC as payment method
    await browser.selectPaymentMethod(PaymentMethod.BASE_USDC);

    // Get deposit information
    const depositInfo = await browser.getDepositInfo(PaymentMethod.BASE_USDC);

    // Verify deposit information
    expect(depositInfo).toBeDefined();
    expect(depositInfo.address).toBeDefined();
    expect(depositInfo.address.length).toBeGreaterThan(0);
    expect(depositInfo.paymentMethod).toBe(PaymentMethod.BASE_USDC);
    expect(depositInfo.amount).toBeDefined();
    expect(depositInfo.amount.length).toBeGreaterThan(0);

    // Log deposit information for manual verification
    console.log("Deposit Information:", depositInfo);
  }, 120000); // 2 minute timeout for this test
});
