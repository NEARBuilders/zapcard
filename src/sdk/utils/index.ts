/**
 * Utility functions for the Sneaky Link SDK
 */

export * from "./retry";
export * from "./human";

/**
 * Sleep for a specified duration
 *
 * @param ms Duration in milliseconds
 * @returns Promise that resolves after the specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random integer between min and max (inclusive)
 *
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for a random duration between min and max milliseconds
 *
 * @param min Minimum duration in milliseconds
 * @param max Maximum duration in milliseconds
 * @returns Promise that resolves after a random duration
 */
export function randomSleep(min: number, max: number): Promise<void> {
  return sleep(randomInt(min, max));
}
