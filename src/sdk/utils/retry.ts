/**
 * Retry utility for handling transient errors
 */

/**
 * Default retry options
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;
  
  /**
   * Base delay in milliseconds
   */
  baseDelay?: number;
  
  /**
   * Maximum delay in milliseconds
   */
  maxDelay?: number;
  
  /**
   * Backoff factor
   */
  backoffFactor?: number;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts or retry options
 * @returns Result of the function
 * @throws Last error encountered
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetriesOrOptions: number | RetryOptions
): Promise<T> {
  // Parse options
  const options: RetryOptions = typeof maxRetriesOrOptions === 'number'
    ? { ...DEFAULT_OPTIONS, maxRetries: maxRetriesOrOptions }
    : { ...DEFAULT_OPTIONS, ...maxRetriesOrOptions };
  
  let lastError: Error | null = null;
  
  // Try the function up to maxRetries times
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, throw the error
      if (attempt === options.maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        (options.baseDelay || 1000) * Math.pow(options.backoffFactor || 2, attempt),
        options.maxDelay || 10000
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}
