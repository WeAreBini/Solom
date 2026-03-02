import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/fmp';

export const dynamic = 'force-dynamic';

// Shape expected by the frontend (lib/api.ts StockQuote and lib/hooks/useRealTimePrice.ts QuoteData)
interface FrontendStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  high52Week: number;
  low52Week: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
}

interface QuoteResponse {
  success: boolean;
  data?: FrontendStockQuote;
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

    const fmpQuote = await getStockQuote(cleanSymbol);

    if (!fmpQuote) {
      return NextResponse.json(
        {
          success: false,
          error: `Quote not found for symbol: ${cleanSymbol}`,
        },
        { status: 404 }
      );
    }

    // Transform FMP field names to the shape the frontend hooks expect
    const quote: FrontendStockQuote = {
      symbol: fmpQuote.symbol,
      name: fmpQuote.name,
      price: fmpQuote.price,
      change: fmpQuote.change,
      changePercent: fmpQuote.changesPercentage,
      avgVolume: fmpQuote.avgVolume,
      marketCap: fmpQuote.marketCap,
      peRatio: fmpQuote.pe ?? null,
      high52Week: fmpQuote.yearHigh,
      low52Week: fmpQuote.yearLow,
      open: fmpQuote.open,
      previousClose: fmpQuote.previousClose,
      dayHigh: fmpQuote.dayHigh,
      dayLow: fmpQuote.dayLow,
      volume: fmpQuote.volume,
    };

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Stock quote error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    if (message.includes('FMP_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: FMP API key not configured',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}