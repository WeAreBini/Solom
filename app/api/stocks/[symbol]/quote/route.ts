import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { StockQuote } from '@/lib/types/stock';

export const dynamic = 'force-dynamic';

interface QuoteResponse {
  success: boolean;
  data?: StockQuote;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse<QuoteResponse>> {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required path parameter: symbol',
        },
        { status: 400 }
      );
    }

    // Validate symbol format (alphanumeric, allow dots and hyphens)
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!/^[A-Z0-9.\-]+$/.test(cleanSymbol)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid symbol format. Only alphanumeric characters, dots, and hyphens are allowed.',
        },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        prices: {
          orderBy: { time: 'desc' },
          take: 2,
        },
        fundamentals: true,
      }
    });

    if (!asset || asset.prices.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Quote not found for symbol: ${cleanSymbol}`,
        },
        { status: 404 }
      );
    }

    const latestPrice = asset.prices[0];
    const previousPrice = asset.prices[1];

    const price = latestPrice.close;
    const previousClose = previousPrice ? previousPrice.close : latestPrice.open;
    const change = price - previousClose;
    const changesPercentage = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const fundamentals = asset.fundamentals;

    const quote: StockQuote = {
      symbol: asset.symbol,
      name: asset.name,
      price: price,
      changesPercentage: changesPercentage,
      change: change,
      dayLow: latestPrice.low,
      dayHigh: latestPrice.high,
      yearHigh: fundamentals?.fiftyTwoWeekHigh ?? latestPrice.high,
      yearLow: fundamentals?.fiftyTwoWeekLow ?? latestPrice.low,
      marketCap: fundamentals?.marketCap ? Number(fundamentals.marketCap) : 0,
      priceAvg50: price, // Fallback if not calculated
      priceAvg200: price, // Fallback if not calculated
      exchange: asset.exchange,
      volume: Number(latestPrice.volume),
      avgVolume: Number(latestPrice.volume), // Fallback
      open: latestPrice.open,
      previousClose: previousClose,
      eps: fundamentals?.eps ?? 0,
      pe: fundamentals?.peRatio ?? 0,
      earningsAnnouncement: '',
      sharesOutstanding: 0,
      timestamp: Math.floor(latestPrice.time.getTime() / 1000),
    };

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Stock quote error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}