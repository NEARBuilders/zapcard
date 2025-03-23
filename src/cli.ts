#!/usr/bin/env bun

/**
 * CLI script for testing the Sneaky Link SDK
 */

import { CardDenomination, PaymentMethod } from "./sdk/api/types";
import { BitrefillBrowser } from "./sdk/browser";

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const headless = !args.includes("--visible");
  const denomination = CardDenomination.VISA_50; // Default to $50
  const paymentMethod = PaymentMethod.BASE_USDC; // Default to Base USDC

  console.log("Sneaky Link CLI");
  console.log("---------------");
  console.log(`Denomination: $${denomination}`);
  console.log(`Payment Method: ${paymentMethod}`);
  console.log(`Headless Mode: ${headless ? "Yes" : "No"}`);
  console.log("");

  // Create browser instance
  const browser = new BitrefillBrowser({
    headless,
    timeout: 60000,
  });

  try {
    // Initialize browser
    console.log("Initializing browser...");
    await browser.initialize();

    // Navigate to product
    console.log("Navigating to Visa gift card...");
    await browser.navigateToProduct(denomination);

    // Select payment method
    console.log("Selecting payment method...");
    await browser.selectPaymentMethod(paymentMethod);

    // Get deposit information
    console.log("Getting deposit information...");
    const depositInfo = await browser.getDepositInfo(paymentMethod);

    // Display deposit information
    console.log("\nDeposit Information:");
    console.log("-------------------");
    console.log(`Address: ${depositInfo.address}`);
    console.log(`Amount: ${depositInfo.amount}`);
    console.log(`Payment Method: ${depositInfo.paymentMethod}`);
    if (depositInfo.qrCodeUrl) {
      console.log(`QR Code: ${depositInfo.qrCodeUrl}`);
    }

    // Wait for user input before closing
    if (!headless) {
      console.log("\nPress Enter to close the browser...");
      await new Promise((resolve) => process.stdin.once("data", resolve));
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
