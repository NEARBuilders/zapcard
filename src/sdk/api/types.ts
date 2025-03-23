/**
 * Type definitions for the Sneaky Link SDK
 */

/**
 * Supported gift card denominations
 */
export enum CardDenomination {
  VISA_25 = 25,
  VISA_50 = 50,
  VISA_100 = 100,
  VISA_200 = 200,
}

/**
 * Supported payment methods
 */
export enum PaymentMethod {
  BASE_USDC = "usdc_base",
  ZCASH = "zcash",
}

/**
 * Purchase status
 */
export enum PurchaseStatus {
  INITIALIZED = "initialized",
  NAVIGATING_CHECKOUT = "navigating_checkout",
  AWAITING_PAYMENT = "awaiting_payment",
  PROCESSING_PAYMENT = "processing_payment",
  COMPLETING_PURCHASE = "completing_purchase",
  PURCHASE_COMPLETE = "purchase_complete",
  PURCHASE_FAILED = "purchase_failed",
  ERROR = "error",
}

/**
 * Gender for name generation
 */
export enum Gender {
  MALE = 0,
  FEMALE = 1,
}

/**
 * Purchase options
 */
export interface PurchaseOptions {
  /**
   * Gift card denomination
   */
  denomination: CardDenomination;

  /**
   * Payment method
   */
  paymentMethod: PaymentMethod;

  /**
   * First name for the purchase (optional)
   * If not provided, a name will be generated based on country or default to US
   */
  firstName?: string;

  /**
   * Last name for the purchase (optional)
   * If not provided, a name will be generated based on country or default to US
   */
  lastName?: string;

  /**
   * Country code for name generation (optional)
   * ISO code for the country (e.g., 'US', 'GB', 'DE')
   * Only used if firstName or lastName is not provided
   * Defaults to 'US' if not specified
   */
  country?: string;

  /**
   * Gender for name generation (optional)
   * Only used if firstName or lastName is not provided
   * Defaults to random selection if not specified
   */
  gender?: Gender;

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
}

/**
 * Deposit information
 */
export interface DepositInfo {
  /**
   * Deposit address
   */
  address: string;

  /**
   * Payment method
   */
  paymentMethod: PaymentMethod;

  /**
   * Amount to deposit
   */
  amount: string;

  /**
   * QR code data URL (if available)
   */
  qrCodeUrl?: string;
}

/**
 * Gift card details
 */
export interface GiftCardDetails {
  /**
   * Card number
   */
  cardNumber: string;

  /**
   * Card expiration date
   */
  expirationDate: string;

  /**
   * Card CVV
   */
  cvv: string;

  /**
   * Card denomination
   */
  denomination: CardDenomination;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  /**
   * Purchase status
   */
  status: PurchaseStatus;

  /**
   * Deposit information (available when status is AWAITING_PAYMENT)
   */
  depositInfo?: DepositInfo;

  /**
   * Gift card details (available when status is PURCHASE_COMPLETE)
   */
  giftCardDetails?: GiftCardDetails;

  /**
   * Error message (available when status is ERROR or PURCHASE_FAILED)
   */
  error?: string;
}

/**
 * Purchase status update callback
 */
export type StatusUpdateCallback = (
  status: PurchaseStatus,
  details?: any,
) => void;
