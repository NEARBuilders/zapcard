/**
 * Type definitions for browser automation
 */

import type { CardDenomination, DepositInfo, PaymentMethod } from '../api/types';

/**
 * Browser options
 */
export interface BrowserOptions {
  /**
   * Headless mode (default: true)
   */
  headless?: boolean;
  
  /**
   * Timeout in milliseconds (default: 30000)
   */
  timeout?: number;
  
  /**
   * Maximum retry attempts (default: 3)
   */
  maxRetries?: number;
  
  /**
   * First name to use for the purchase
   * Default: Generated based on country
   */
  firstName?: string;
  
  /**
   * Last name to use for the purchase
   * Default: Generated based on country
   */
  lastName?: string;
  
  /**
   * Country code for the purchase (ISO code, e.g., 'US', 'GB', 'DE')
   * Default: 'US'
   */
  country?: string;
}

/**
 * Base browser interface
 */
export interface Browser {
  /**
   * Initialize the browser
   */
  initialize(): Promise<void>;
  
  /**
   * Close the browser
   */
  close(): Promise<void>;
}

/**
 * Bitrefill browser interface
 */
export interface IBitrefillBrowser extends Browser {
  /**
   * Navigate to a product page
   * 
   * @param denomination Card denomination
   */
  navigateToProduct(denomination: CardDenomination): Promise<void>;
  
  /**
   * Select a payment method
   * 
   * @param method Payment method
   */
  selectPaymentMethod(method: PaymentMethod): Promise<void>;
  
  /**
   * Get deposit information
   * 
   * @param method Payment method
   * @returns Deposit information
   */
  getDepositInfo(method: PaymentMethod): Promise<DepositInfo>;
  
  /**
   * Complete the purchase after payment
   * 
   * @returns Whether the purchase was completed successfully
   */
  completePurchase(): Promise<boolean>;
}
