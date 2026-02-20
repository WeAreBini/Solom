'use client';

/**
 * @ai-context Client component rendering House of Representatives STOCK Act disclosures.
 * Uses PaginatedTable for navigation through potentially large datasets.
 * Green badge for purchases, red badge for sales — matching SenateTradesTable conventions.
 * @ai-related app/insider-senate/page.tsx, components/insider-senate/SenateTradesTable.tsx
 * @ai-related components/ui/paginated-table.tsx
 * @ai-warning Must remain a Client Component — constructs JSX cells for PaginatedTable.
 */

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PaginatedTable } from '@/components/ui/paginated-table';

// ---------------------------------------------------------------------------
// Types (mirror the return shape of getHouseTrades in app/actions/fmp.ts)
// ---------------------------------------------------------------------------

export interface HouseTrade {
  disclosureYear: string;
  disclosureDate: string;
  transactionDate: string;
  owner: string;
  ticker: string;
  assetDescription: string;
  type: string;
  amount: string;
  representative: string;
  district: string;
  link: string;
  capitalGainsOver200USD: boolean;
}

interface Props {
  trades: HouseTrade[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the trade type is a purchase (green badge), false for sale (red badge).
 * @param type Raw type string from FMP (e.g. "purchase", "sale_full", "sale_partial")
 */
function isBuy(type: string): boolean {
  const t = type?.toUpperCase() ?? '';
  return t.includes('PURCHASE') || t === 'BUY';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HEADERS = ['Date', 'Representative', 'Asset', 'Ticker', 'Transaction Type', 'Amount Range', 'District'];

/**
 * Renders paginated house trade disclosures.
 * @param trades - Array of house trade objects from getHouseTrades()
 */
export function HouseTradesTable({ trades }: Props) {
  const rows: React.ReactNode[][] = trades.map((row, i) => {
    const buy = isBuy(row.type);

    return [
      // Date
      <span key={`d-${i}`} className="text-sm text-muted-foreground whitespace-nowrap">
        {row.transactionDate || row.disclosureDate}
      </span>,

      // Representative name
      <span key={`rep-${i}`} className="font-medium">
        {row.representative || row.owner}
      </span>,

      // Asset description (truncated for table)
      <span key={`a-${i}`} className="text-sm max-w-[200px] truncate block" title={row.assetDescription}>
        {row.assetDescription}
      </span>,

      // Ticker badge or dash — linked to ticker detail page
      row.ticker ? (
        <Link key={`tk-${i}`} href={`/ticker/${row.ticker}`}>
          <Badge variant="secondary" className="font-mono font-semibold hover:bg-secondary/80 cursor-pointer">
            {row.ticker}
          </Badge>
        </Link>
      ) : (
        <span key={`tk-${i}`} className="text-muted-foreground text-sm">
          —
        </span>
      ),

      // Transaction type — green for buy, red for sell (design tokens)
      <Badge
        key={`ty-${i}`}
        variant={buy ? 'default' : 'destructive'}
        className={
          buy
            ? 'bg-positive/15 text-positive border-positive/30 hover:bg-positive/20'
            : 'bg-negative/15 text-negative border-negative/30 hover:bg-negative/20'
        }
      >
        {row.type}
      </Badge>,

      // Amount range (right-aligned)
      <span key={`amt-${i}`} className="block text-right text-sm">
        {row.amount}
      </span>,

      // District
      <span key={`dist-${i}`} className="text-sm text-muted-foreground">
        {row.district || '—'}
      </span>,
    ];
  });

  return <PaginatedTable headers={HEADERS} rows={rows} itemsPerPage={15} />;
}
