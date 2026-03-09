import { NextResponse } from 'next/server';
import { getMarketIndices, isFMPConfigured } from '@/lib/fmp';
import type { MarketIndex } from '@/lib/types/stock';

export const dynamic = 'force-dynamic';

interface IndicesResponse {
  success: boolean;
  data?: MarketIndex[];
  error?: string;
  count: number;
  demo?: boolean;
}

export async function GET(): Promise<NextResponse<IndicesResponse>> {
  try {
    const indices = await getMarketIndices();
    const isDemo = !isFMPConfigured();

    return NextResponse.json({
      success: true,
      data: indices.map((idx: { symbol: string; name: string; price: number; change: number; changesPercentage: number }) => ({
        symbol: idx.symbol,
        name: idx.name,
        price: idx.price,
        change: idx.change,
        changesPercentage: idx.changesPercentage,
      })),
      count: indices.length,
      demo: isDemo,
    });
  } catch (error) {
    console.error('Market indices error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: message,
        count: 0,
      },
      { status: 500 }
    );
  }
}