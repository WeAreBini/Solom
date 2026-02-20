"use client";

/**
 * @ai-context Client component that renders a search input and the filtered 13F holdings table.
 * Receives pre-fetched holdings from the Server Component parent and does client-side filtering only.
 * No network requests are made here.
 * @ai-related app/13f/page.tsx
 * @ai-warning Must stay a Client Component so useState works; do NOT add `async` here.
 */

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { PaginatedTable } from "@/components/ui/paginated-table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThirteenFHolding {
  tickercusip: string;
  nameOfIssuer: string;
  shares: number;
  value: number;
  /** Pre-computed percentage of total portfolio (0–100) */
  portfolioPct: number;
}

interface ThirteenFFilterProps {
  holdings: ThirteenFHolding[];
  /** Pre-formatted total portfolio value string, e.g. "$347.5B" */
  totalFormatted: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatValue(raw: number): string {
  if (raw >= 1_000_000_000_000) return `$${(raw / 1_000_000_000_000).toFixed(2)}T`;
  if (raw >= 1_000_000_000) return `$${(raw / 1_000_000_000).toFixed(2)}B`;
  if (raw >= 1_000_000) return `$${(raw / 1_000_000).toFixed(2)}M`;
  return `$${raw.toLocaleString()}`;
}

function formatShares(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ThirteenFFilter({ holdings, totalFormatted }: ThirteenFFilterProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return holdings;
    const q = query.toLowerCase();
    return holdings.filter(
      (h) =>
        h.tickercusip.toLowerCase().includes(q) ||
        h.nameOfIssuer.toLowerCase().includes(q)
    );
  }, [holdings, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "position" : "positions"} &bull; Total portfolio:{" "}
          <span className="font-semibold text-foreground">{totalFormatted}</span>
        </p>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter by ticker or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table — rendered via PaginatedTable for built-in pagination */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No holdings match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <PaginatedTable
          headers={['Symbol', 'Company Name', 'Shares', 'Value', '% of Portfolio']}
          rows={filtered.map((h, i) => [
            <Badge key={`sym-${i}`} variant="secondary" className="font-mono font-semibold">
              {h.tickercusip}
            </Badge>,
            <span key={`name-${i}`} className="font-medium">{h.nameOfIssuer}</span>,
            <span key={`sh-${i}`} className="block text-right font-mono text-sm">
              {formatShares(h.shares)}
            </span>,
            <span key={`val-${i}`} className="block text-right font-mono text-sm">
              {formatValue(h.value * 1000)}
            </span>,
            <div key={`pct-${i}`} className="flex items-center justify-end gap-2">
              <div
                className="h-1.5 rounded-full bg-primary/60"
                style={{ width: `${Math.max(h.portfolioPct, 0.5) * 4}px`, maxWidth: "48px" }}
              />
              <span className="text-sm tabular-nums">{h.portfolioPct.toFixed(2)}%</span>
            </div>,
          ])}
          itemsPerPage={15}
        />
      )}
    </div>
  );
}
