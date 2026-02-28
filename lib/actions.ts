/**
 * Server Actions for Solom Finance Platform
 * 
 * Next.js 15+ with React 19 Server Actions
 * 
 * Best practices implemented:
 * - 'use server' directive at the top
 * - Zod validation for input
 * - Proper error handling with user-friendly messages
 * - Revalidation after mutations
 * - TypeScript strict mode
 * 
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================

const addToWatchlistSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9.\-]+$/, 'Invalid symbol format'),
});

const removeFromWatchlistSchema = z.object({
  symbol: z.string().min(1).max(10),
});

// ============================================
// Types
// ============================================

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface WatchlistResult {
  symbol: string;
  added: boolean;
}

// ============================================
// Server Actions
// ============================================

/**
 * Add a stock to the user's watchlist
 */
export async function addToWatchlist(
  formData: FormData
): Promise<ActionResult<WatchlistResult>> {
  try {
    const symbol = formData.get('symbol') as string;
    const validation = addToWatchlistSchema.safeParse({ symbol });
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Invalid symbol',
      };
    }

    // In a real app: persist to database after auth
    
    revalidatePath('/dashboard');
    
    return {
      success: true,
      data: {
        symbol: validation.data.symbol,
        added: true,
      },
    };
  } catch (error) {
    console.error('[ServerAction] addToWatchlist error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add to watchlist';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Remove a stock from the user's watchlist
 */
export async function removeFromWatchlist(
  formData: FormData
): Promise<ActionResult<{ symbol: string }>> {
  try {
    const symbol = formData.get('symbol') as string;
    const validation = removeFromWatchlistSchema.safeParse({ symbol });
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Invalid symbol',
      };
    }

    revalidatePath('/dashboard');
    
    return {
      success: true,
      data: { symbol: validation.data.symbol },
    };
  } catch (error) {
    console.error('[ServerAction] removeFromWatchlist error:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove from watchlist';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Refresh stock quotes for the dashboard
 */
export async function refreshMarketData(): Promise<ActionResult> {
  try {
    revalidatePath('/dashboard');
    revalidatePath('/api/market');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[ServerAction] refreshMarketData error:', error);
    return {
      success: false,
      error: 'Failed to refresh market data',
    };
  }
}