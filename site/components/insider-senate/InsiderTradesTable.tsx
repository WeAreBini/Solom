'use client';

/**
 * @ai-context Client component that renders insider trades using PaginatedTable.
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
// Types (mirror the return shape of getInsiderTrades in app/actions/fmp.ts)
// ---------------------------------------------------------------------------

export interface InsiderTrade {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingName: string;
  typeOfOwner: string;
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  securitiesOwned: number;
  companyCik: string;
  reportingCik: string;
}

interface Props {
  trades: InsiderTrade[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the transaction is a purchase (green), false for sale (red).
 */
function isBuy(transactionType: string): boolean {
  const t = transactionType?.toUpperCase() ?? '';
  return t.includes('P-PURCHASE') || t === 'PURCHASE' || t === 'BUY';
}

function formatCurrency(value: number): string {
  if (!value || isNaN(value)) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatShares(n: number): string {
  if (!n || isNaN(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HEADERS = ['Filing Date', 'Ticker', 'Name', 'Title', 'Transaction', 'Shares', 'Price', 'Value'];

export function InsiderTradesTable({ trades }: Props) {
  const rows: React.ReactNode[][] = trades.map((row, i) => {
    const buy = isBuy(row.transactionType);
    const tradeValue =
      row.price && row.securitiesTransacted ? row.price * row.securitiesTransacted : 0;

    return [
      <span key={`d-${i}`} className="text-sm text-muted-foreground whitespace-nowrap">
        {row.filingDate}
      </span>,
      <Link key={`s-${i}`} href={`/ticker/${row.symbol}`}>
        <Badge variant="secondary" className="font-mono font-semibold hover:bg-secondary/80 cursor-pointer">
          {row.symbol}
        </Badge>
      </Link>,
      <span key={`n-${i}`} className="font-medium">
        {row.reportingName}
      </span>,
      <span key={`t-${i}`} className="text-sm text-muted-foreground">
        {row.typeOfOwner}
      </span>,
      <Badge
        key={`tx-${i}`}
        variant={buy ? 'default' : 'destructive'}
        className={
          buy
            ? 'bg-positive/15 text-positive border-positive/30 hover:bg-positive/20'
            : 'bg-negative/15 text-negative border-negative/30 hover:bg-negative/20'
        }
      >
        {row.transactionType}
      </Badge>,
      <span key={`sh-${i}`} className="block text-right font-mono text-sm">
        {formatShares(row.securitiesTransacted)}
      </span>,
      <span key={`p-${i}`} className="block text-right font-mono text-sm">
        {row.price ? `$${row.price.toFixed(2)}` : '—'}
      </span>,
      <span key={`v-${i}`} className="block text-right font-mono text-sm">
        {formatCurrency(tradeValue)}
      </span>,
    ];
  });

  return <PaginatedTable headers={HEADERS} rows={rows} itemsPerPage={15} />;
}
