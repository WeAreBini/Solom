/**
 * API utility functions for request validation.
 */

/**
 * Validates and parses the limit query parameter.
 * Returns null if the value is invalid (NaN, non-finite, or < 1).
 * 
 * @param limitParam - The raw limit parameter from the request
 * @returns The parsed limit number, or null if invalid
 * 
 * @example
 * parseLimitParam('10')     // 10
 * parseLimitParam('abc')    // null (NaN)
 * parseLimitParam('-5')     // null (negative)
 * parseLimitParam('0')      // null (zero)
 * parseLimitParam(null)     // 10 (default)
 * parseLimitParam('')       // null (empty string)
 */
export function parseLimitParam(limitParam: string | null): number | null {
  if (!limitParam) return 10; // Default value
  
  const parsed = parseInt(limitParam, 10);
  
  // Check for NaN and non-finite values (Infinity, -Infinity)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  
  return parsed;
}
