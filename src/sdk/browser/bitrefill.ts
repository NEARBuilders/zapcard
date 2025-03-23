/**
 * Bitrefill browser automation
 */

import { chromium } from 'playwright';
import type { Browser as PlaywrightBrowser, Page, Frame } from 'playwright';
import type { BrowserOptions, IBitrefillBrowser } from './types';
import type { CardDenomination, DepositInfo, PaymentMethod } from '../api/types';
import { retry } from '../utils';

/**
 * Bitrefill embed demo URL
 */
const BITREFILL_EMBED_URL = 'https://www.bitrefill.com/embed-demo.html';

/**
 * Selectors for Bitrefill elements
 */
const SELECTORS = {
  // Iframe
  iframe: 'iframe[src*="bitrefill.com"]',

  // Cookies banner
  cookiesBanner: 'div.cookie-dialog',
  cookiesAcceptSelectedButton: 'button:has-text("Only selected")',
  cookiesAcceptAllButton: 'button[data-cy="accept-cookies"]',

  // Product selection
  productSearch: 'input[placeholder="Search for products or phone number"]',
  visaGiftCardOption: 'li a[href*="/physical-prepaid-visa-usa/"]',

  // Amount input
  amountInput: 'input[name="bill_amount"]',

  // Payment method selection
  paymentMethodOption: (method: string) => `button[data-testid="payment-method-${method}"]`,

  // Deposit information
  depositAddress: 'div[data-testid="deposit-address"]',
  depositAmount: 'div[data-testid="deposit-amount"]',
  depositQrCode: 'img[data-testid="deposit-qr-code"]',

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
      this.log('Launching browser...');

      // Launch browser with minimal options to mimic a normal user browser
      this.browser = await chromium.launch({
        headless: this.options.headless,
        timeout: this.options.timeout,
      });

      this.log('Creating browser context...');

      // Create new context with standard user settings
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: false, // Normal browsers don't ignore HTTPS errors
        permissions: ['clipboard-read', 'clipboard-write'],
        // Respect the iframe's sandbox permissions
        bypassCSP: false,
      });

      this.log('Creating new page...');

      // Create new page
      this.page = await context.newPage();

      // Set timeout
      if (this.page) {
        this.page.setDefaultTimeout(this.options.timeout || 120000);

        this.log(`Navigating to ${BITREFILL_EMBED_URL}...`);

        await this.page.goto(BITREFILL_EMBED_URL, {
          waitUntil: 'networkidle', // Wait for network to be idle to ensure everything is loaded
          timeout: this.options.timeout,
        });

        this.log('Navigation complete, page loaded');

        this.log('Waiting for iframe to appear...');

        // Wait for iframe to load
        const frameElement = await this.page.waitForSelector(SELECTORS.iframe, {
          timeout: this.options.timeout,
        });

        const frameUrl = await frameElement.getAttribute('src');

        if (!frameUrl) {
          throw new Error('Failed to find iframe URL');
        }

        this.log(`Found iframe with URL: ${frameUrl}`);

        // Get iframe content
        const frames = this.page.frames();
        this.log(`Found ${frames.length} frames`);

        // Try to find the Bitrefill frame
        const frame = frames.find((f: Frame) => {
          const url = f.url();
          this.log(`Checking frame URL: ${url}`);
          return url.includes('embed.bitrefill.com');
        });

        if (!frame) {
          throw new Error('Failed to access iframe content');
        }

        this.log('Found Bitrefill iframe');

        // Store frame handle for future use
        this.frameHandle = frame;

        // Wait for iframe content to load by looking for the Bitrefill logo
        this.log('Waiting for iframe content to load...');

        try {
          // Try waiting for the search input
          this.log('Trying to wait for search input...');
          await frame.waitForSelector('input[placeholder="Search for products or phone number"]', {
            timeout: this.options.timeout,
          });
          this.log('Search input found, iframe content loaded');
        } catch (searchError) {
          // If we can't find the search input either, fall back to a fixed timeout
          this.log(`Could not find search input: ${searchError instanceof Error ? searchError.message : String(searchError)}`);
        }

        // Handle the cookies banner by finding the dialog and clicking the button
        this.log('Handling cookies banner...');
        try {
          // First set the cookie directly as a fallback
          await frame.evaluate(() => {
            document.cookie = 'consent={%22functionality_storage%22:true%2C%22analytics_storage%22:false%2C%22ad_storage%22:false%2C%22personalization_storage%22:false}; path=/; max-age=31536000; domain=embed.bitrefill.com; SameSite=None; Secure; Partitioned';
            return true;
          });
          
          this.log('Consent cookie set as fallback');
          
          // Try to find the cookie dialog by role and class
          this.log('Looking for cookie dialog by role and class...');
          const cookieDialogSelector = 'div[role="dialog"].cookie-dialog';
          
          // Wait for the cookie dialog to appear
          try {
            await frame.waitForSelector(cookieDialogSelector, {
              timeout: 5000 // 5 seconds timeout
            });
            this.log('Found cookie dialog by role and class');
            
            // Now try to find and click the "Only selected" button
            this.log('Looking for "Only selected" button...');
            const onlySelectedButton = frame.locator('button:has-text("Only selected")');
            
            if (await onlySelectedButton.count() > 0) {
              this.log('Found "Only selected" button, clicking it...');
              await onlySelectedButton.click();
              this.log('Clicked "Only selected" button');
              
              // Wait for the dialog to disappear
              await frame.waitForSelector(cookieDialogSelector, {
                state: 'hidden',
                timeout: 5000
              });
              this.log('Cookie dialog disappeared after clicking button');
            } else {
              this.log('Could not find "Only selected" button');
              throw new Error('Could not find "Only selected" button');
            }
          } catch (dialogError) {
            this.log(`Could not find or interact with cookie dialog: ${dialogError instanceof Error ? dialogError.message : String(dialogError)}`);
            
            // If we couldn't find or interact with the dialog, try to hide it using CSS
            this.log('Trying to hide cookie banner using CSS...');
            await frame.evaluate(() => {
              const selectors = [
                'div[role="dialog"]',
                'div.cookie-dialog',
                'div:has-text("Want cookies?")'
              ];
              
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.setAttribute('aria-hidden', 'true');
                  }
                });
              });
            });
            
            this.log('Attempted to hide cookie banner using CSS');
          }
        } catch (error) {
          this.log(`Warning: Error setting consent cookie: ${error instanceof Error ? error.message : String(error)}`);
          this.log('Continuing with initialization...');
        }

        this.log('Browser initialization complete');
      } else {
        throw new Error('Failed to create page');
      }
    } catch (error) {
      this.log(`Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`);

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
      this.log('Closing browser...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.frameHandle = null;
      this.log('Browser closed');
    }
  }

  /**
   * Navigate to a product page
   * 
   * @param denomination Card denomination
   */
  async navigateToProduct(denomination: CardDenomination): Promise<void> {
    if (!this.frameHandle) {
      throw new Error('Browser not initialized');
    }

    this.log(`Navigating to product with denomination: $${denomination}`);

    // Use retry utility for resilience
    await retry(async () => {
      if (!this.frameHandle) return;

      // Navigate directly to the Virtual Prepaid Visa page
      this.log('Navigating directly to Virtual Prepaid Visa page...');
      await this.frameHandle.goto('https://embed.bitrefill.com/us/en/gift-cards/virtual-prepaid-visa-usa/');
      
      this.log('Waiting for page to load...');
      await this.frameHandle.waitForLoadState('networkidle');

      // Wait for amount input to appear and fill it using getByRole
      this.log('Waiting for amount input field...');
      await this.frameHandle.waitForSelector(SELECTORS.amountInput, {
        timeout: this.options.timeout,
      });

      // Enter the denomination amount using direct selector for better reliability
      this.log(`Entering amount: $${denomination}`);
      
      // First clear the input field
      await this.frameHandle.fill(SELECTORS.amountInput, '');
      
      // Then type the amount directly
      await this.frameHandle.type(SELECTORS.amountInput, denomination.toString(), { delay: 100 });
      
      // Force blur event to trigger validation
      await this.frameHandle.evaluate((selector) => {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input) {
          input.blur();
          // Also dispatch input and change events to ensure the value is registered
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, SELECTORS.amountInput);

      // Wait for add to cart button and click it
      this.log('Waiting for add to cart button...');
      const submitBtn = this.frameHandle.getByRole("button", { name: "Add to cart"});

      this.log('Clicking add to cart button...');
      await submitBtn.click();

      this.log('Product navigation complete');
    }, this.options.maxRetries || 3);
  }

  /**
   * Select a payment method
   * 
   * @param method Payment method
   */
  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    if (!this.frameHandle) {
      throw new Error('Browser not initialized');
    }

    this.log(`Selecting payment method: ${method}`);

    // Use retry utility for resilience
    await retry(async () => {
      if (!this.frameHandle) return;

      // Wait for payment method options to appear
      this.log(`Waiting for ${method} payment method option...`);
      await this.frameHandle.waitForSelector(SELECTORS.paymentMethodOption(method), {
        timeout: this.options.timeout,
      });

      // Select payment method
      this.log(`Clicking on ${method} payment method option...`);
      await this.frameHandle.click(SELECTORS.paymentMethodOption(method));

      // Wait for continue button and click it
      this.log('Waiting for continue button...');
      await this.frameHandle.waitForSelector(SELECTORS.submitButton, {
        timeout: this.options.timeout,
      });

      this.log('Clicking continue button...');
      await this.frameHandle.click(SELECTORS.submitButton);

      this.log('Payment method selection complete');
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
      throw new Error('Browser not initialized');
    }

    this.log('Getting deposit information...');

    // Use retry utility for resilience
    return await retry(async () => {
      if (!this.frameHandle) {
        throw new Error('Browser not initialized');
      }

      // Wait for deposit address to appear
      this.log('Waiting for deposit address...');
      await this.frameHandle.waitForSelector(SELECTORS.depositAddress, {
        timeout: this.options.timeout,
      });

      // Extract deposit information
      this.log('Extracting deposit address...');
      const address = await this.frameHandle.textContent(SELECTORS.depositAddress) || '';

      this.log('Extracting deposit amount...');
      const amount = await this.frameHandle.textContent(SELECTORS.depositAmount) || '';

      // Extract QR code if available
      let qrCodeUrl: string | undefined;
      try {
        this.log('Checking for QR code...');
        const qrCodeElement = await this.frameHandle.waitForSelector(SELECTORS.depositQrCode, {
          timeout: 5000
        });
        qrCodeUrl = await qrCodeElement.getAttribute('src') || undefined;
        this.log('QR code found');
      } catch (error) {
        this.log('QR code not available');
        // QR code might not be available, which is fine
      }

      this.log('Deposit information extraction complete');

      return {
        address: address.trim(),
        paymentMethod: method,
        amount: amount.trim(),
        qrCodeUrl,
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
      throw new Error('Browser not initialized');
    }

    // This is a placeholder for the actual implementation
    // In a real implementation, we would:
    // 1. Wait for payment confirmation
    // 2. Click continue button
    // 3. Extract gift card details

    throw new Error('Not implemented yet');
  }
}
