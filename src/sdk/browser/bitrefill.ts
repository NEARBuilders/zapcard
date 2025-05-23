/**
 * Bitrefill browser automation
 */

import type { Frame, Page, Browser as PlaywrightBrowser } from "playwright";
import { chromium } from "playwright";
import type {
  CardDenomination,
  DepositInfo,
  PaymentMethod,
} from "../api/types";
import {
  generateHumanFirstName,
  generateHumanLastName,
  handleCookieBanner,
  humanClick,
  humanClickLocator,
  humanScroll,
  humanType,
  randomExploration,
  randomSleep,
  retry,
  shouldPerformAction,
} from "../utils";
import type { BrowserOptions, IBitrefillBrowser } from "./types";

/**
 * Bitrefill embed demo URL
 */
const BITREFILL_EMBED_URL = "https://www.bitrefill.com/embed-demo.html";

/**
 * Selectors for Bitrefill elements
 */
const SELECTORS = {
  // Iframe
  iframe: 'iframe[src*="bitrefill.com"]',

  // Cookies banner
  cookiesBanner: "div.cookie-dialog",
  cookiesAcceptSelectedButton: 'button:has-text("Only selected")',
  cookiesAcceptAllButton: 'button[data-cy="accept-cookies"]',

  // Product selection
  productSearch: 'input[placeholder="Search for products or phone number"]',
  visaGiftCardOption: 'li a[href*="/physical-prepaid-visa-usa/"]',

  // Amount input
  amountInput: 'input[name="bill_amount"]',

  // Payment method selection
  paymentMethodOption: (method: string) =>
    `button[data-cy="payment-method-${method}-button"]`,
  continueButton: 'button[data-cy="continue-button"]',

  // Customer information dialog
  firstNameInput: 'input[id="first_name"], input[name="first_name"]',
  lastNameInput: 'input[id="last_name"], input[name="last_name"]',
  payNowButton: 'button[name="pay-now-button"]',

  // Email input and continue button
  emailInput:
    'input[id="email"], input[name="email"], input[data-cy="email-input"]',
  continueToPaymentButton: 'button[data-cy="continue-to-payment-button"]',

  // Deposit information
  copyButton: 'button:has-text("Copy")',
  qrCodeButton: 'button:has-text("Scan QR")',

  // Purchase completion
  submitButton: 'button[type="submit"]',
  // Multiple selectors for Add to Cart button to increase chances of finding it
  addToCartButton: 'button:has-text("Add to cart")',

  // Gift card details
  cardNumber: 'div[data-testid="card-number"]',
  cardExpiration: 'div[data-testid="card-expiration"]',
  cardCvv: 'div[data-testid="card-cvv"]',
};

/**
 * Default browser options
 */
const DEFAULT_OPTIONS: BrowserOptions = {
  headless: true,
  timeout: 30000,
  maxRetries: 3,
  firstName: generateHumanFirstName(),
  lastName: generateHumanLastName(),
  country: "US",
};

/**
 * Bitrefill browser implementation
 */
export class BitrefillBrowser implements IBitrefillBrowser {
  private browser: PlaywrightBrowser | null = null;
  private page: Page | null = null;
  private frameHandle: Frame | null = null;
  private options: BrowserOptions;

  /**
   * Create a new BitrefillBrowser instance
   *
   * @param options Browser options
   */
  constructor(options: BrowserOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Log a message with timestamp
   *
   * @param message Message to log
   */
  private log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    try {
      this.log("Launching browser...");

      // Launch browser with minimal options to mimic a normal user browser
      this.browser = await chromium.launch({
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-extensions",
          "--disable-infobars",
          "--enable-automation",
          "--no-first-run",
          "--enable-webgl",
        ],
        headless: this.options.headless,
        timeout: this.options.timeout,
      });

      this.log("Creating browser context...");

      // Create new context with standard user settings
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        ignoreHTTPSErrors: false, // Normal browsers don't ignore HTTPS errors
        permissions: ["clipboard-read", "clipboard-write"],
        // Respect the iframe's sandbox permissions
        bypassCSP: false,
      });

      this.log("Creating new page...");

      // Create new page
      this.page = await context.newPage();

      // Set timeout
      if (this.page) {
        this.page.setDefaultTimeout(this.options.timeout || 120000);

        this.log(`Navigating to ${BITREFILL_EMBED_URL}...`);

        await this.page.goto(BITREFILL_EMBED_URL, {
          waitUntil: "networkidle", // Wait for network to be idle to ensure everything is loaded
          timeout: this.options.timeout,
        });

        this.log("Navigation complete, page loaded");

        this.log("Waiting for iframe to appear...");

        // Wait for iframe to load
        const frameElement = await this.page.waitForSelector(SELECTORS.iframe, {
          timeout: this.options.timeout,
        });

        const frameUrl = await frameElement.getAttribute("src");

        if (!frameUrl) {
          throw new Error("Failed to find iframe URL");
        }

        this.log(`Found iframe with URL: ${frameUrl}`);

        // Get iframe content
        const frames = this.page.frames();
        this.log(`Found ${frames.length} frames`);

        // Try to find the Bitrefill frame
        const frame = frames.find((f: Frame) => {
          const url = f.url();
          this.log(`Checking frame URL: ${url}`);
          return url.includes("embed.bitrefill.com");
        });

        if (!frame) {
          throw new Error("Failed to access iframe content");
        }

        this.log("Found Bitrefill iframe");

        // Store frame handle for future use
        this.frameHandle = frame;

        // Wait for iframe content to load by looking for the Bitrefill logo
        this.log("Waiting for iframe content to load...");

        try {
          // Try waiting for the search input
          this.log("Trying to wait for search input...");
          await frame.waitForSelector(
            'input[placeholder="Search for products or phone number"]',
            {
              timeout: this.options.timeout,
            },
          );
          this.log("Search input found, iframe content loaded");
        } catch (searchError) {
          // If we can't find the search input either, fall back to a fixed timeout
          this.log(
            `Could not find search input: ${searchError instanceof Error ? searchError.message : String(searchError)}`,
          );
        }

        // Handle the cookies banner in a human-like way
        this.log("Handling cookies banner...");
        try {
          await handleCookieBanner(frame, this.log.bind(this));

          // Add some random human-like behavior after handling cookies
          if (shouldPerformAction(0.7)) {
            // Sometimes explore the page a bit after handling cookies
            await randomSleep(500, 1500);
            await randomExploration(frame, this.log.bind(this));
          }
        } catch (error) {
          this.log(
            `Warning: Error handling cookie banner: ${error instanceof Error ? error.message : String(error)}`,
          );
          this.log("Continuing with initialization...");
        }

        this.log("Browser initialization complete");
      } else {
        throw new Error("Failed to create page");
      }
    } catch (error) {
      this.log(
        `Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Clean up resources on error
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.page = null;
      this.frameHandle = null;

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      this.log("Closing browser...");
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.frameHandle = null;
      this.log("Browser closed");
    }
  }

  /**
   * Navigate to a product page
   *
   * @param denomination Card denomination
   */
  async navigateToProduct(denomination: CardDenomination): Promise<void> {
    if (!this.frameHandle) {
      throw new Error("Browser not initialized");
    }

    this.log(`Navigating to product with denomination: $${denomination}`);

    // Use retry utility for resilience
    await retry(async () => {
      if (!this.frameHandle) return;

      // Navigate directly to the Virtual Prepaid Visa page
      this.log("Navigating directly to Virtual Prepaid Visa page...");
      await this.frameHandle.goto(
        "https://embed.bitrefill.com/us/en/gift-cards/virtual-prepaid-visa-usa/",
      );

      this.log("Waiting for page to load...");
      await this.frameHandle.waitForLoadState("networkidle");

      // Add some random human-like behavior
      if (shouldPerformAction(0.7)) {
        await randomExploration(this.frameHandle, this.log.bind(this));
      }

      // Wait for amount input to appear
      this.log("Waiting for amount input field...");
      await this.frameHandle.waitForSelector(SELECTORS.amountInput, {
        timeout: this.options.timeout,
      });

      // Enter the denomination amount using human-like typing
      this.log(`Entering amount: $${denomination}`);
      await humanType(
        this.frameHandle,
        SELECTORS.amountInput,
        denomination.toString(),
        { clearFirst: true, typingSpeed: "medium" },
        this.options.timeout,
        this.log.bind(this),
      );

      // Force blur event to trigger validation
      await this.frameHandle.evaluate((selector) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input) {
          input.blur();
          // Also dispatch input and change events to ensure the value is registered
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, SELECTORS.amountInput);

      // Add a small delay like a human would
      await randomSleep(500, 1500);

      // Wait for add to cart button and click it with human-like behavior
      this.log("Waiting for add to cart button...");
      const submitBtn = this.frameHandle.getByRole("button", {
        name: "Add to cart",
      });

      // Sometimes pause a bit before clicking (like a human would)
      if (shouldPerformAction(0.6)) {
        await randomSleep(500, 1200);
      }

      this.log("Clicking add to cart button...");
      await humanClickLocator(
        this.frameHandle,
        submitBtn,
        this.options.timeout,
        this.log.bind(this),
      );

      // Wait for the customer information dialog to appear
      this.log("Waiting for customer information dialog...");
      try {
        // Wait for first name input to appear
        await this.frameHandle.waitForSelector(SELECTORS.firstNameInput, {
          timeout: this.options.timeout,
        });

        this.log(`Entering first name: ${this.options.firstName}`);
        await humanType(
          this.frameHandle,
          SELECTORS.firstNameInput,
          this.options.firstName!,
          { clearFirst: true, typingSpeed: "medium" },
          this.options.timeout,
          this.log.bind(this),
        );

        this.log(`Entering last name: ${this.options.lastName}`);
        await humanType(
          this.frameHandle,
          SELECTORS.lastNameInput,
          this.options.lastName!,
          { clearFirst: true, typingSpeed: "medium" },
          this.options.timeout,
          this.log.bind(this),
        );

        // Add a small delay like a human would
        await randomSleep(500, 1200);

        // Click the "Pay now" button
        this.log("Clicking Pay now button...");
        const payNowBtn = this.frameHandle.locator(SELECTORS.payNowButton);
        await humanClickLocator(
          this.frameHandle,
          payNowBtn,
          this.options.timeout,
          this.log.bind(this),
        );

        // Enter email
        await this.frameHandle.waitForSelector(SELECTORS.emailInput, {
          timeout: this.options.timeout,
        });

        // Generate email from first and last name
        const email = `${this.options.firstName!.toLowerCase()}.${this.options.lastName!.toLowerCase()}@gmail.com`;
        this.log(`Entering email: ${email}`);

        await humanType(
          this.frameHandle,
          SELECTORS.emailInput,
          email,
          { clearFirst: true, typingSpeed: "medium" },
          this.options.timeout,
          this.log.bind(this),
        );

        // Add a small delay like a human would
        await randomSleep(500, 1200);

        // Wait for continue to payment button to be enabled
        this.log("Waiting for continue to payment button to be enabled...");
        await this.frameHandle.waitForSelector(
          `${SELECTORS.continueToPaymentButton}:not([disabled])`,
          {
            timeout: this.options.timeout,
          },
        );

        // Click the continue to payment button
        this.log("Clicking continue to payment button...");
        const continueToPaymentBtn = this.frameHandle.locator(
          SELECTORS.continueToPaymentButton,
        );
        await humanClickLocator(
          this.frameHandle,
          continueToPaymentBtn,
          this.options.timeout,
          this.log.bind(this),
        );
      } catch (error) {
        this.log(
          `Warning: Error handling customer information dialog: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.log("Continuing with selection...");
      }

      this.log("Product selection complete");
    }, this.options.maxRetries || 3);
  }

  /**
   * Select a payment method
   *
   * @param method Payment method
   */
  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    if (!this.frameHandle) {
      throw new Error("Browser not initialized");
    }

    this.log(`Selecting payment method: ${method}`);

    // Use retry utility for resilience
    await retry(async () => {
      if (!this.frameHandle) return;

      // Wait for payment method options to appear
      this.log(`Waiting for ${method} payment method option...`);
      await this.frameHandle.waitForSelector(
        SELECTORS.paymentMethodOption(method),
        {
          timeout: this.options.timeout,
        },
      );

      // Add random human-like exploration behavior
      this.log("Exploring payment method options...");
      await randomExploration(this.frameHandle, this.log.bind(this));
      await randomSleep(1000, 3000);

      // Select payment method with human-like click
      this.log(`Clicking on ${method} payment method option...`);
      await humanClick(
        this.frameHandle,
        SELECTORS.paymentMethodOption(method),
        this.options.timeout,
        this.log.bind(this),
      );

      // Wait for continue button and click it with human-like behavior
      this.log("Waiting for continue button...");
      await this.frameHandle.waitForSelector(SELECTORS.continueButton, {
        timeout: this.options.timeout,
      });

      // Add a small delay like a human would
      await randomSleep(1000, 2500);

      this.log("Clicking continue button...");
      await humanClick(
        this.frameHandle,
        SELECTORS.continueButton,
        this.options.timeout,
        this.log.bind(this),
      );

      this.log("Payment method selection complete");
    }, this.options.maxRetries || 3);
  }

  /**
   * Get deposit information
   *
   * @param method Payment method
   * @returns Deposit information
   */
  async getDepositInfo(method: PaymentMethod): Promise<DepositInfo> {
    if (!this.frameHandle) {
      throw new Error("Browser not initialized");
    }

    this.log("Getting deposit information...");

    // Use retry utility for resilience
    return await retry(async () => {
      if (!this.frameHandle || !this.page) {
        throw new Error("Browser not initialized");
      }

      // Wait for copy buttons to appear
      this.log("Waiting for copy buttons to appear...");
      await this.frameHandle.waitForSelector(SELECTORS.copyButton, {
        timeout: this.options.timeout,
      });

      // Add some random human-like behavior
      if (shouldPerformAction(0.5)) {
        // Sometimes scroll around a bit before extracting info
        await humanScroll(
          this.frameHandle,
          "down",
          "random",
          "slow",
          this.log.bind(this),
        );
        await randomSleep(500, 1200);
        await humanScroll(
          this.frameHandle,
          "up",
          "random",
          "slow",
          this.log.bind(this),
        );
        await randomSleep(300, 800);
      }

      // Extract deposit information by clicking the address copy button
      this.log("Waiting for address copy button...");
      const copyButtons = this.frameHandle.locator(SELECTORS.copyButton);

      this.log("Clicking address copy button...");
      await humanClickLocator(
        this.frameHandle,
        copyButtons.first(),
        this.options.timeout,
        this.log.bind(this),
      );

      // Wait for clipboard to be populated
      await randomSleep(500, 1000);

      // Get address from clipboard
      const address = await this.page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      console.log(`Deposit address: ${address}`);

      // Add a small delay like a human would
      await randomSleep(500, 1000);

      // Click the amount copy button
      this.log("Waiting for amount copy button...");

      this.log("Clicking amount copy button...");
      await humanClickLocator(
        this.frameHandle,
        copyButtons.last(),
        this.options.timeout,
        this.log.bind(this),
      );

      // Wait for clipboard to be populated
      await randomSleep(500, 1000);

      // Get amount from clipboard
      const amount = await this.page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      console.log(`Deposit amount: ${amount}`);

      this.log("Deposit information extraction complete");

      return {
        address: address.trim(),
        paymentMethod: method,
        amount: amount.trim(),
      };
    }, this.options.maxRetries || 3);
  }

  /**
   * Complete the purchase after payment
   *
   * @returns Whether the purchase was completed successfully
   */
  async completePurchase(): Promise<boolean> {
    if (!this.frameHandle) {
      throw new Error("Browser not initialized");
    }

    // This is a placeholder for the actual implementation
    // In a real implementation, we would:
    // 1. Wait for payment confirmation
    // 2. Click continue button
    // 3. Extract gift card details

    throw new Error("Not implemented yet");
  }
}
