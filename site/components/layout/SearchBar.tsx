"use client";

/**
 * @ai-context Live search autocomplete bar for the TopNav.
 * Debounces keystrokes by 300ms, calls the `searchSymbols` Server Action,
 * and renders a dropdown with clickable symbol links.
 * @ai-related components/layout/TopNav.tsx, app/actions/fmp.ts
 * @ai-security searchSymbols is a Server Action — API key never exposed to client.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, X } from "lucide-react";
import { searchSymbols } from "@/app/actions/fmp";

type SearchResult = {
  symbol: string;
  name: string;
  stockExchange: string;
  exchangeShortName: string;
};

/**
 * SearchBar — renders a search input with live autocomplete dropdown.
 * Results are debounced 300ms to avoid excessive Server Action calls.
 * Click-outside and Escape key close the dropdown.
 */
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // @ai-context Wrap the container so we can detect outside clicks
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Debounced search effect ---
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchSymbols(query.trim());
        setResults(data.slice(0, 8));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // --- Click-outside detection ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Escape key detection ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Input row */}
      <div className="relative flex items-center">
        {loading ? (
          <Loader2 className="absolute left-2.5 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search symbols, news..."
          className="w-full rounded-md border border-input bg-background pl-8 pr-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={closeDropdown}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((item) => (
                <li key={item.symbol}>
                  <Link
                    href={`/ticker/${item.symbol}`}
                    onClick={closeDropdown}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {/* Symbol — bold */}
                      <span className="font-semibold shrink-0 text-foreground">
                        {item.symbol}
                      </span>
                      {/* Company name — muted, truncated */}
                      <span className="text-muted-foreground truncate">
                        {item.name}
                      </span>
                    </span>
                    {/* Exchange badge */}
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground uppercase tracking-wide">
                      {item.exchangeShortName || item.stockExchange}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !loading &&
            query.length > 1 && (
              <p className="px-3 py-3 text-sm text-muted-foreground text-center">
                No results found for &ldquo;{query}&rdquo;
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
