import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/fmp';
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

    const quote = await getStockQuote(cleanSymbol);

    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          error: `Quote not found for symbol: ${cleanSymbol}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Stock quote error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for FMP API key error
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