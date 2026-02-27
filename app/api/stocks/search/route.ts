import { NextRequest, NextResponse } from 'next/server';
import { searchStocks } from '@/lib/fmp';
import type { StockSearchResult } from '@/lib/types/stock';

export const dynamic = 'force-dynamic';

interface SearchResponse {
  success: boolean;
  data?: StockSearchResult[];
  error?: string;
  count: number;
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

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

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 100',
          count: 0,
        },
        { status: 400 }
      );
    }

    const results = await searchStocks(query, limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
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