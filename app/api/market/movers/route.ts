import { NextRequest, NextResponse } from 'next/server';
import { getMarketMovers, isFMPConfigured } from '@/lib/fmp';
import type { MarketMover } from '@/lib/types/stock';
import { parseLimitParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface MoversResponse {
  success: boolean;
  data?: {
    gainers: MarketMover[];
    losers: MarketMover[];
  };
  error?: string;
  gainersCount: number;
  losersCount: number;
  demo?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse<MoversResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'gainers', 'losers', or null for both
    const limitParam = searchParams.get('limit');
    const limit = parseLimitParam(limitParam);

    if (limit === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be a valid number between 1 and 50',
          gainersCount: 0,
          losersCount: 0,
        },
        { status: 400 }
      );
    }

    if (limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 50',
          gainersCount: 0,
          losersCount: 0,
        },
        { status: 400 }
      );
    }

    const movers = await getMarketMovers();
    const isDemo = !isFMPConfigured();

    // Filter by type if specified
    let gainers = movers.gainers.slice(0, limit);
    let losers = movers.losers.slice(0, limit);

    if (type === 'gainers') {
      losers = [];
    } else if (type === 'losers') {
      gainers = [];
    }

    // Return movers data with consistent field names
    const mapMover = (m: MarketMover) => ({
      symbol: m.symbol,
      name: m.name,
      price: m.price,
      change: m.change,
      changesPercentage: m.changesPercentage,
      dayLow: m.dayLow,
      dayHigh: m.dayHigh,
      yearHigh: m.yearHigh,
      yearLow: m.yearLow,
      marketCap: m.marketCap,
      volume: m.volume,
      avgVolume: m.avgVolume,
      exchange: m.exchange,
      open: m.open,
      previousClose: m.previousClose,
      eps: m.eps,
      pe: m.pe,
      earningsAnnouncement: m.earningsAnnouncement,
      sharesOutstanding: m.sharesOutstanding,
      timestamp: m.timestamp,
    });

    return NextResponse.json({
      success: true,
      data: {
        gainers: gainers.map(mapMover),
        losers: losers.map(mapMover),
      },
      gainersCount: gainers.length,
      losersCount: losers.length,
      demo: isDemo,
    });
  } catch (error) {
    console.error('Market movers error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: message,
        gainersCount: 0,
        losersCount: 0,
      },
      { status: 500 }
    );
  }
}
