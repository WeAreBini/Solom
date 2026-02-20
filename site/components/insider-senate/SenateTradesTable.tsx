'use client';

/**
 * @ai-context Client component that renders senate trades using PaginatedTable.
 * Accepts typed data from the Server Component parent (page.tsx) and builds ReactNode rows.
 * Needed because Server Components cannot pass JSX ReactNode[][] to Client Components directly.
 * @ai-related app/insider-senate/page.tsx, components/ui/paginated-table.tsx
 * @ai-warning Must remain a Client Component — it constructs JSX cells for PaginatedTable.
 */

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PaginatedTable } from '@/components/ui/paginated-table';

// ---------------------------------------------------------------------------
// Types (mirror the return shape of getSenateTrades in app/actions/fmp.ts)
// ---------------------------------------------------------------------------

export interface SenateTrade {
  dateRecieved: string;
  transactionDate: string;
  owner: string;
  ticker: string;
  assetDescription: string;
  type: string;
  amount: string;
  senator: string;
  district: string;
  comment: string;
  link: string;
}

interface Props {
  trades: SenateTrade[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the trade type is a purchase (green), false for sale (red).
 */
function isBuy(type: string): boolean {
  const t = type?.toUpperCase() ?? '';
  return t.includes('P-PURCHASE') || t === 'PURCHASE' || t === 'BUY';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HEADERS = ['Date', 'Senator', 'Asset', 'Ticker', 'Type', 'Amount Range'];

export function SenateTradesTable({ trades }: Props) {
  const rows: React.ReactNode[][] = trades.map((row, i) => {
    const buy = isBuy(row.type);

    return [
      <span key={`d-${i}`} className="text-sm text-muted-foreground whitespace-nowrap">
        {row.transactionDate || row.dateRecieved}
      </span>,
      <span key={`sn-${i}`} className="font-medium">
        {row.senator || row.owner}
      </span>,
      <span key={`a-${i}`} className="text-sm max-w-[200px] truncate block">
        {row.assetDescription}
      </span>,
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
      <span key={`amt-${i}`} className="block text-right text-sm">
        {row.amount}
      </span>,
    ];
  });

  return <PaginatedTable headers={HEADERS} rows={rows} itemsPerPage={15} />;
}
