import { NextRequest, NextResponse } from 'next/server';
import { searchStocks, getMultipleQuotes } from '@/lib/fmp';
import { parseLimitParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// Shape expected by the frontend (lib/api.ts StockSearchResult)
interface FrontendSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
}

interface SearchResponse {
  success: boolean;
  data?: FrontendSearchResult[];
  error?: string;
  count: number;
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const limitParam = searchParams.get('limit');
    const limit = parseLimitParam(limitParam);

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required query parameter: q or query',
          count: 0,
        },
        { status: 400 }
      );
    }

    if (query.length < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query must be at least 1 character',
          count: 0,
        },
        { status: 400 }
      );
    }

    if (limit === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be a valid number between 1 and 100',
          count: 0,
        },
        { status: 400 }
      );
    }

    if (limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 100',
          count: 0,
        },
        { status: 400 }
      );
    }

    const searchResults = await searchStocks(query, limit);

    if (searchResults.length === 0) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    // Batch-fetch quotes to enrich results with price data
    const symbols = searchResults.map((r) => r.symbol);
    const quotes = await getMultipleQuotes(symbols);
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

    const data: FrontendSearchResult[] = searchResults.map((result) => {
      const quote = quoteMap.get(result.symbol);
      return {
        symbol: result.symbol,
        name: result.name,
        price: quote?.price ?? 0,
        change: quote?.change ?? 0,
        changePercent: quote?.changesPercentage ?? 0,
        volume: quote?.volume ?? 0,
        marketCap: quote?.marketCap ?? 0,
        peRatio: quote?.pe ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Stock search error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for FMP API key error
    if (message.includes('FMP_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: FMP API key not configured',
          count: 0,
        },
        { status: 500 }
      );
    }

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
