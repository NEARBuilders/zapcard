/**
 * Human-like interaction utilities
 */

import type { Frame, Locator } from 'playwright';
import { randomSleep, randomInt } from './index';
import { fullName as generateFullName, firstName as generateFirstName, lastName as generateLastName } from 'full-name-generator';
import { Gender } from '../api/types';

/**
 * Generate a full name based on country and gender
 * 
 * @param country ISO country code (e.g., 'US', 'GB', 'DE')
 * @param gender Gender for name generation
 * @returns Generated full name
 */
export function generateHumanName(
  country: string = 'US',
  gender: Gender = Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE
): { firstName: string; lastName: string } {
  // Generate full name
  const fullNameStr = generateFullName(country, gender);
  
  // Split into first and last name
  const nameParts = fullNameStr.split(' ');
  
  // Extract first and last name
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  
  return { firstName, lastName };
}

/**
 * Generate a first name based on country and gender
 * 
 * @param country ISO country code (e.g., 'US', 'GB', 'DE')
 * @param gender Gender for name generation
 * @returns Generated first name
 */
export function generateHumanFirstName(
  country: string = 'US',
  gender: Gender = Math.random() < 0.5 ? Gender.MALE : Gender.FEMALE
): string {
  return generateFirstName(country, gender);
}

/**
 * Generate a last name based on country and gender
 * 
 * @param country ISO country code (e.g., 'US', 'GB', 'DE')
 * @param gender Gender for name generation (required for some countries)
 * @returns Generated last name
 */
export function generateHumanLastName(
  country: string = 'US',
  gender?: Gender
): string {
  return generateLastName(country, gender);
}

/**
 * Perform human-like scrolling in a frame
 * 
 * @param frame Frame to scroll in
 * @param direction 'down' or 'up'
 * @param distance Distance to scroll in pixels, or 'random' for a random distance
 * @param speed 'slow', 'medium', or 'fast'
 * @param logger Optional logging function
 */
export async function humanScroll(
  frame: Frame,
  direction: 'down' | 'up' = 'down', 
  distance: number | 'random' = 'random',
  speed: 'slow' | 'medium' | 'fast' = 'medium',
  logger?: (message: string) => void
): Promise<void> {
  if (logger) logger(`Scrolling ${direction}...`);
  
  // Determine scroll distance
  let scrollDistance: number;
  if (distance === 'random') {
    // Random scroll between 100 and 500 pixels
    scrollDistance = randomInt(100, 500);
  } else {
    scrollDistance = distance;
  }
  
  // Adjust distance for scroll direction
  if (direction === 'up') {
    scrollDistance = -scrollDistance;
  }
  
  // Determine scroll speed (delay between scroll steps)
  let scrollDelay: number;
  switch (speed) {
    case 'slow':
      scrollDelay = randomInt(40, 60);
      break;
    case 'fast':
      scrollDelay = randomInt(10, 20);
      break;
    case 'medium':
    default:
      scrollDelay = randomInt(20, 40);
      break;
  }
  
  // Number of steps to break the scroll into (for smooth scrolling)
  const steps = Math.abs(Math.floor(scrollDistance / randomInt(10, 30)));
  const scrollStep = scrollDistance / steps;
  
  // Perform scrolling in steps
  for (let i = 0; i < steps; i++) {
    await frame.evaluate((step) => {
      window.scrollBy(0, step);
    }, scrollStep);
    
    // Random delay between scroll steps
    await randomSleep(scrollDelay, scrollDelay * 2);
  }
  
  // Add a small pause after scrolling
  await randomSleep(300, 800);
  
  if (logger) logger(`Scrolled ${direction} ${Math.abs(scrollDistance)} pixels`);
}

/**
 * Simulate human-like mouse movement to an element
 * 
 * @param frame Frame containing the element
 * @param selector Element selector to move to
 * @param timeout Timeout in milliseconds
 * @param logger Optional logging function
 * @returns Whether the movement was successful
 */
export async function humanMouseMove(
  frame: Frame,
  selector: string,
  timeout: number = 30000,
  logger?: (message: string) => void
): Promise<boolean> {
  try {
    // Find the element
    const element = await frame.waitForSelector(selector, { timeout });
    
    if (!element) return false;
    
    // Get element position
    const boundingBox = await element.boundingBox();
    if (!boundingBox) return false;
    
    // Calculate target position (random point within the element)
    const targetX = boundingBox.x + randomInt(5, Math.max(5, boundingBox.width - 5));
    const targetY = boundingBox.y + randomInt(5, Math.max(5, boundingBox.height - 5));
    
    // Move mouse to element with human-like motion
    await frame.evaluate(({ x, y }) => {
      // Create a custom event for mouse movement
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      
      // Dispatch the event at the document level
      document.dispatchEvent(moveEvent);
      
      // Find element at the target position and hover it
      const targetElement = document.elementFromPoint(x, y);
      if (targetElement) {
        targetElement.dispatchEvent(new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        }));
      }
    }, { x: targetX, y: targetY });
    
    return true;
  } catch (error) {
    if (logger) logger(`Mouse movement failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Human-like click on an element
 * 
 * @param frame Frame containing the element
 * @param selector Element selector to click
 * @param timeout Timeout in milliseconds
 * @param logger Optional logging function
 * @returns Whether the click was successful
 */
export async function humanClick(
  frame: Frame,
  selector: string,
  timeout: number = 30000,
  logger?: (message: string) => void
): Promise<boolean> {
  try {
    // Find the element
    const element = await frame.waitForSelector(selector, { timeout });
    
    if (!element) return false;
    
    // Move mouse to element first (human-like)
    await humanMouseMove(frame, selector, timeout, logger);
    
    // Wait a bit before clicking (like a human would)
    await randomSleep(300, 800);
    
    // Click the element
    await element.click();
    
    // Wait a bit after clicking (like a human would)
    await randomSleep(500, 1000);
    
    return true;
  } catch (error) {
    if (logger) logger(`Click failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Human-like typing into an input field
 * 
 * @param frame Frame containing the element
 * @param selector Element selector to type into
 * @param text Text to type
 * @param options Typing options
 * @param timeout Timeout in milliseconds
 * @param logger Optional logging function
 * @returns Whether the typing was successful
 */
export async function humanType(
  frame: Frame,
  selector: string, 
  text: string, 
  options: { 
    clearFirst?: boolean, 
    typingSpeed?: 'slow' | 'medium' | 'fast' 
  } = {},
  timeout: number = 30000,
  logger?: (message: string) => void
): Promise<boolean> {
  const { clearFirst = true, typingSpeed = 'medium' } = options;
  
  try {
    // Find the input element
    const element = await frame.waitForSelector(selector, { timeout });
    
    if (!element) return false;
    
    // Move mouse to element first (human-like)
    await humanMouseMove(frame, selector, timeout, logger);
    
    // Wait a bit before clicking (like a human would)
    await randomSleep(300, 800);
    
    // Click the element to focus it
    await element.click();
    
    // Clear the field if requested
    if (clearFirst) {
      await frame.fill(selector, '');
      await randomSleep(200, 500);
    }
    
    // Determine typing delay based on speed
    let typingDelay: number;
    switch (typingSpeed) {
      case 'slow':
        typingDelay = randomInt(100, 200);
        break;
      case 'fast':
        typingDelay = randomInt(30, 70);
        break;
      case 'medium':
      default:
        typingDelay = randomInt(70, 120);
        break;
    }
    
    // Type the text with human-like delays
    await frame.type(selector, text, { delay: typingDelay });
    
    // Wait a bit after typing (like a human would)
    await randomSleep(300, 800);
    
    return true;
  } catch (error) {
    if (logger) logger(`Typing failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Handle cookie banner in a human-like way
 * 
 * @param frame Frame containing the cookie banner
 * @param logger Optional logging function
 */
export async function handleCookieBanner(
  frame: Frame,
  logger?: (message: string) => void
): Promise<void> {
  if (logger) logger('Looking for cookie banner...');
  
  try {
    // Wait a bit before looking for the cookie banner (like a human would)
    await randomSleep(1000, 2000);
    
    // Try to find the cookie dialog by role and class
    const cookieDialogSelector = 'div[role="dialog"].cookie-dialog, div.cookie-dialog';
    
    // Check if cookie banner exists
    const cookieBannerExists = await frame.evaluate((selector) => {
      return !!document.querySelector(selector);
    }, cookieDialogSelector);
    
    if (!cookieBannerExists) {
      if (logger) logger('No cookie banner found');
      return;
    }
    
    if (logger) logger('Cookie banner found');
    
    // Scroll down slightly to see the banner better (human-like behavior)
    await humanScroll(frame, 'down', randomInt(50, 100), 'slow', logger);
    
    // Wait a bit before interacting with the banner (like a human would)
    await randomSleep(800, 1500);
    
    // Try different button selectors
    const buttonSelectors = [
      'button:has-text("Only selected")',
      'button:has-text("Accept selected")',
      'button[data-cy="accept-cookies"]',
      'button:has-text("Accept")',
      'button.cookie-accept'
    ];
    
    let buttonClicked = false;
    
    for (const buttonSelector of buttonSelectors) {
      try {
        const buttonExists = await frame.evaluate((selector) => {
          return !!document.querySelector(selector);
        }, buttonSelector);
        
        if (buttonExists) {
          // Move mouse to button first (human-like)
          await humanMouseMove(frame, buttonSelector, 5000, logger);
          
          // Wait a bit before clicking (like a human would)
          await randomSleep(300, 800);
          
          // Click the button
          await frame.click(buttonSelector);
          
          if (logger) logger(`Clicked cookie banner button: ${buttonSelector}`);
          buttonClicked = true;
          
          // Wait for the dialog to disappear
          await frame.waitForSelector(cookieDialogSelector, {
            state: 'hidden',
            timeout: 5000
          });
          
          break;
        }
      } catch (error) {
        if (logger) logger(`Failed to click ${buttonSelector}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (!buttonClicked) {
      // If we couldn't click any button, try to set the cookie directly
      if (logger) logger('Could not click any cookie banner button, setting cookie directly');
      await frame.evaluate(() => {
        document.cookie = 'consent={%22functionality_storage%22:true%2C%22analytics_storage%22:false%2C%22ad_storage%22:false%2C%22personalization_storage%22:false}; path=/; max-age=31536000; domain=embed.bitrefill.com; SameSite=None; Secure; Partitioned';
        
        // Also try to hide the banner using CSS
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
    }
    
    // Wait a bit after handling the cookie banner
    await randomSleep(500, 1000);
    
  } catch (error) {
    if (logger) logger(`Cookie banner handling failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Randomly decide whether to perform an action based on probability
 * 
 * @param probability Probability of performing the action (0-1)
 * @returns Whether to perform the action
 */
export function shouldPerformAction(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Human-like click on a Playwright Locator
 * 
 * @param frame Frame containing the locator
 * @param locator Playwright Locator to click
 * @param timeout Timeout in milliseconds
 * @param logger Optional logging function
 * @returns Whether the click was successful
 */
export async function humanClickLocator(
  frame: Frame,
  locator: Locator,
  timeout: number = 30000,
  logger?: (message: string) => void
): Promise<boolean> {
  try {
    // Wait for the locator to be visible
    await locator.waitFor({ state: 'visible', timeout });
    
    // Get the element handle from the locator
    const elementHandle = await locator.elementHandle();
    if (!elementHandle) {
      if (logger) logger('Failed to get element handle from locator');
      return false;
    }
    
    // Get the bounding box of the element
    const boundingBox = await elementHandle.boundingBox();
    if (!boundingBox) {
      if (logger) logger('Failed to get bounding box of element');
      return false;
    }
    
    // Calculate target position (random point within the element)
    const targetX = boundingBox.x + randomInt(5, Math.max(5, boundingBox.width - 5));
    const targetY = boundingBox.y + randomInt(5, Math.max(5, boundingBox.height - 5));
    
    // Move mouse to element with human-like motion
    await frame.evaluate(({ x, y }) => {
      // Create a custom event for mouse movement
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      
      // Dispatch the event at the document level
      document.dispatchEvent(moveEvent);
      
      // Find element at the target position and hover it
      const targetElement = document.elementFromPoint(x, y);
      if (targetElement) {
        targetElement.dispatchEvent(new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        }));
      }
    }, { x: targetX, y: targetY });
    
    // Wait a bit before clicking (like a human would)
    await randomSleep(300, 800);
    
    // Click the element
    await locator.click();
    
    // Wait a bit after clicking (like a human would)
    await randomSleep(500, 1000);
    
    return true;
  } catch (error) {
    if (logger) logger(`Locator click failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Add random human-like exploration behavior
 * 
 * @param frame Frame to explore
 * @param logger Optional logging function
 */
export async function randomExploration(
  frame: Frame,
  logger?: (message: string) => void
): Promise<void> {
  // Randomly decide whether to explore
  if (!shouldPerformAction(0.3)) return;
  
  if (logger) logger('Performing random exploration...');
  
  // Random number of exploration actions
  const actions = randomInt(1, 3);
  
  for (let i = 0; i < actions; i++) {
    // Choose a random action
    const actionType = randomInt(1, 3);
    
    switch (actionType) {
      case 1:
        // Random scrolling
        const scrollDirection = Math.random() < 0.7 ? 'down' : 'up';
        await humanScroll(frame, scrollDirection, 'random', 'medium', logger);
        break;
      
      case 2:
        // Random pause
        if (logger) logger('Taking a short break...');
        await randomSleep(1000, 3000);
        break;
      
      case 3:
        // Random mouse movement to a visible element
        try {
          // Get all visible elements that might be interesting to hover
          const elements = await frame.evaluate(() => {
            const interestingTags = ['a', 'button', 'img', 'h1', 'h2', 'h3', 'div.product', 'div.card'];
            
            // Combine selectors
            const selector = interestingTags.join(', ');
            
            // Get all elements matching the selector
            const allElements = Array.from(document.querySelectorAll(selector));
            
            // Filter to only visible elements
            const visibleElements = allElements.filter(el => {
              const rect = el.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
              );
            });
            
            // Return element selectors with some context to find them
            return visibleElements.map(el => {
              // Try to get a unique selector for this element
              let selector = '';
              
              // Use id if available
              if (el.id) {
                selector = `#${el.id}`;
              } 
              // Use class if available
              else if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').filter(c => c.trim().length > 0);
                if (classes.length > 0) {
                  selector = `.${classes.join('.')}`;
                }
              }
              
              // Fallback to tag name
              if (!selector) {
                selector = el.tagName.toLowerCase();
              }
              
              // Add text content for buttons and links
              if ((el.tagName === 'BUTTON' || el.tagName === 'A') && el.textContent) {
                const text = el.textContent.trim().substring(0, 20);
                if (text) {
                  selector += `:has-text("${text}")`;
                }
              }
              
              return selector;
            });
          });
          
          if (elements.length > 0) {
            // Pick a random element
            const randomElement = elements[randomInt(0, elements.length - 1)];
            
            if (logger) logger(`Moving mouse to random element: ${randomElement}`);
            
            // Move mouse to the element
            await humanMouseMove(frame, randomElement, 5000, logger);
            
            // Sometimes click the element (20% chance)
            if (shouldPerformAction(0.2)) {
              if (logger) logger(`Clicking random element: ${randomElement}`);
              await humanClick(frame, randomElement, 5000, logger);
              
              // If we clicked something, we might need to go back
              await randomSleep(1000, 2000);
              
              // 50% chance to go back if we clicked something
              if (shouldPerformAction(0.5)) {
                if (logger) logger('Going back after random click');
                // Use page.goBack() via evaluation since Frame doesn't have goBack method
                await frame.evaluate(() => {
                  window.history.back();
                });
                await randomSleep(1000, 2000);
              }
            }
          }
        } catch (error) {
          if (logger) logger(`Random exploration failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
    }
    
    // Wait between actions
    await randomSleep(500, 1500);
  }
  
  if (logger) logger('Random exploration complete');
}
