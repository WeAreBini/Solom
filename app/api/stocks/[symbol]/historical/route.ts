import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData, getIntradayData } from '@/lib/fmp';
import type { HistoricalDataPoint } from '@/lib/fmp';

export const dynamic = 'force-dynamic';

type Period = '1D' | '1W' | '1M' | '3M' | '1Y';

interface HistoricalResponse {
  success: boolean;
  data?: HistoricalDataPoint[];
  error?: string;
  symbol: string;
  period: Period;
  count: number;
}

const VALID_PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse<HistoricalResponse>> {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required path parameter: symbol',
          symbol: '',
          period: '1M',
          count: 0,
        },
        { status: 400 }
      );
    }

    // Validate symbol format
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!/^[A-Z0-9.\-]+$/.test(cleanSymbol)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid symbol format',
          symbol: cleanSymbol,
          period: '1M',
          count: 0,
        },
        { status: 400 }
      );
    }

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as Period) || '1M';

    // Validate period
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid period. Valid periods: ${VALID_PERIODS.join(', ')}`,
          symbol: cleanSymbol,
          period,
          count: 0,
        },
        { status: 400 }
      );
    }

    // Fetch historical data
    const data = period === '1D'
      ? await getIntradayData(cleanSymbol)
      : await getHistoricalData(cleanSymbol, period);

    return NextResponse.json({
      success: true,
      data,
      symbol: cleanSymbol,
      period,
      count: data.length,
    });
  } catch (error) {
    console.error('Historical data error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for FMP API key error
    if (message.includes('FMP_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: FMP API key not configured',
          symbol: '',
          period: '1M',
          count: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        symbol: '',
        period: '1M',
        count: 0,
      },
      { status: 500 }
    );
  }
}