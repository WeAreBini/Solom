"use client";

/**
 * @ai-context WatchlistActions — client component for adding/removing watchlist items.
 * Rendered in two modes:
 *   1. No `symbol` prop  → shows a search input + "Add to Watchlist" button.
 *   2. `symbol` + `mode="remove"` → shows a compact "Remove" button for a specific ticker.
 *
 * Both modes interact directly with Supabase via the browser client.
 * Router is refreshed after mutations so the Server Component re-fetches.
 *
 * @ai-related app/watchlist/page.tsx
 * @ai-related utils/supabase/client.ts
 * @ai-security Uses the anon browser client; RLS on `watchlist_items` enforces user_id ownership.
 */

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WatchlistActionsProps {
  /**
   * When provided, the component renders as a "Remove" button for this symbol.
   * When omitted, renders the full "Add ticker" search bar.
   */
  symbol?: string;
  /** Controls rendering mode: 'add' (default) or 'remove'. */
  mode?: 'add' | 'remove';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dual-mode client component for watchlist mutations.
 *
 * Add mode  — renders a search input + Add button.
 * Remove mode — renders a compact X / Remove button.
 *
 * @param symbol  Ticker symbol to remove (remove mode only).
 * @param mode    'add' | 'remove' — defaults to 'add'.
 */
export function WatchlistActions({ symbol, mode = 'add' }: WatchlistActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tickerInput, setTickerInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Add a ticker to the watchlist
  // -------------------------------------------------------------------------
  async function handleAdd() {
    const sym = tickerInput.trim().toUpperCase();
    if (!sym) {
      setError('Please enter a ticker symbol.');
      return;
    }

    setError(null);
    const supabase = createClient();

    // Verify the user is signed in before writing
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in to add to your watchlist.');
      return;
    }

    const { error: insertError } = await supabase.from('watchlist_items').insert({
      user_id: user.id,
      symbol: sym,
    });

    if (insertError) {
      // Unique-constraint violation → duplicate ticker
      if (insertError.code === '23505') {
        setError(`${sym} is already in your watchlist.`);
      } else {
        setError(insertError.message);
      }
      return;
    }

    setTickerInput('');
    // Refresh the Server Component tree so the new item appears
    startTransition(() => router.refresh());
  }

  // -------------------------------------------------------------------------
  // Remove a ticker from the watchlist
  // -------------------------------------------------------------------------
  async function handleRemove() {
    if (!symbol) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('symbol', symbol);

    startTransition(() => router.refresh());
  }

  // -------------------------------------------------------------------------
  // Remove mode — compact button
  // -------------------------------------------------------------------------
  if (mode === 'remove' && symbol) {
    return (
      <Button
        variant="destructive"
        size="icon"
        className="h-7 w-7 rounded-full shadow"
        disabled={isPending}
        onClick={handleRemove}
        aria-label={`Remove ${symbol} from watchlist`}
        title={`Remove ${symbol}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </Button>
    );
  }

  // -------------------------------------------------------------------------
  // Add mode — search bar + button
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full max-w-sm items-center space-x-2">
        {/* Ticker search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Add ticker (e.g. AAPL)…"
            className="pl-8 uppercase"
            value={tickerInput}
            onChange={(e) => {
              setTickerInput(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            disabled={isPending}
            aria-label="Ticker symbol to add"
          />
        </div>

        {/* Add button */}
        <Button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !tickerInput.trim()}
          aria-label="Add to watchlist"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>

      {/* Inline error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
