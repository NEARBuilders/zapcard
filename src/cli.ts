#!/usr/bin/env bun

/**
 * CLI script for testing the Sneaky Link SDK
 */

import { CardDenomination, PaymentMethod } from "./sdk/api/types";
import { initiateCheckout } from "./sdk/api/purchase";

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

  try {
    // Initiate checkout process
    console.log("Initiating checkout process...");
    const depositInfo = await initiateCheckout({
      denomination,
      paymentMethod,
      headless,
      timeout: 60000,
    });

    // Display deposit information
    console.log("\nDeposit Information:");
    console.log("-------------------");
    console.log(`Address: ${depositInfo.address}`);
    console.log(`Amount: ${depositInfo.amount}`);
    console.log(`Payment Method: ${depositInfo.paymentMethod}`);
    if (depositInfo.qrCodeUrl) {
      console.log(`QR Code: ${depositInfo.qrCodeUrl}`);
    }

    // Wait for user input before exiting if not headless
    if (!headless) {
      console.log("\nPress Enter to exit...");
      await new Promise((resolve) => process.stdin.once("data", resolve));
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
