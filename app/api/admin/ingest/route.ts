import { NextRequest, NextResponse } from 'next/server';
import { ingestAssetProfile, ingestHistoricalData } from '@/lib/ingestion/market-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, symbol, period1, period2, interval } = body;

    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid symbol is required' },
        { status: 400 }
      );
    }

    const sanitizedSymbol = symbol.toUpperCase().trim();
    if (!/^[A-Z0-9.\-%]+$/.test(sanitizedSymbol)) {
      return NextResponse.json(
        { success: false, error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    if (!action || !['profile', 'historical', 'both'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action (profile, historical, both) is required' },
        { status: 400 }
      );
    }

    const results: any = {};

    if (action === 'profile' || action === 'both') {
      try {
        const profileResult = await ingestAssetProfile(sanitizedSymbol);
        results.profile = profileResult;
      } catch (error: any) {
        results.profile = { success: false, error: error.message };
      }
    }

    if (action === 'historical' || action === 'both') {
      try {
        // Default period1 to 1 year ago if not provided
        const defaultPeriod1 = new Date();
        defaultPeriod1.setFullYear(defaultPeriod1.getFullYear() - 1);
        
        const p1 = period1 || defaultPeriod1;
        const p2 = period2 || new Date();
        const inv = interval || '1d';

        // Map yf intervals
        const validIntervals = ['1d', '1h', '15m'] as const;
        if (!validIntervals.includes(inv as any)) {
           return NextResponse.json(
             { success: false, error: `Invalid interval: ${inv}` },
             { status: 400 }
           );
        }

        const histResult = await ingestHistoricalData(sanitizedSymbol, p1, p2, inv as any);
        results.historical = histResult;
      } catch (error: any) {
        results.historical = { success: false, error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Ingestion API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
