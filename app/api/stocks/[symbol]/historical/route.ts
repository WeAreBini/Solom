import { NextRequest, NextResponse } from 'next/server';
import { 
  HistoricalDataPoint, 
  IndicatorConfig,
  ChartData 
} from '@/lib/types/stock';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD,
  generateSimulatedHistoricalData,
  validateIndicatorParams 
} from '@/lib/indicators';

export const dynamic = 'force-dynamic';

interface HistoricalDataParams {
  params: Promise<{ symbol: string }>;
}

interface HistoricalDataResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
}

// Default indicator configurations
const DEFAULT_INDICATORS: IndicatorConfig[] = [
  { type: 'sma', enabled: false, params: { period: 20 } },
  { type: 'ema', enabled: false, params: { period: 20 } },
  { type: 'rsi', enabled: false, params: { period: 14 } },
  { type: 'macd', enabled: false, params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
];

// Period to days mapping
const PERIOD_DAYS: Record<string, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '2Y': 730,
  '5Y': 1825,
};

/**
 * Calculate all requested indicators for the historical data
 */
function calculateIndicators(
  data: HistoricalDataPoint[],
  indicators: IndicatorConfig[]
): ChartData['indicators'] {
  const result: ChartData['indicators'] = {
    sma: [],
    ema: [],
    rsi: [],
    macd: [],
    volume: data.map(d => ({ time: d.date, value: d.volume })),
  };

  for (const indicator of indicators) {
    if (!indicator.enabled) continue;

    const validation = validateIndicatorParams(indicator.type, indicator.params);
    if (!validation.valid) {
      console.warn(`Invalid parameters for ${indicator.type}:`, validation.error);
      continue;
    }

    switch (indicator.type) {
      case 'sma':
        result.sma = calculateSMA(data, indicator.params.period);
        break;
      case 'ema':
        result.ema = calculateEMA(data, indicator.params.period);
        break;
      case 'rsi':
        result.rsi = calculateRSI(data, indicator.params.period);
        break;
      case 'macd':
        result.macd = calculateMACD(
          data,
          indicator.params.fastPeriod as number,
          indicator.params.slowPeriod as number,
          indicator.params.signalPeriod as number
        );
        break;
    }
  }

  return result;
}

/**
 * GET /api/stocks/[symbol]/historical
 * 
 * Query parameters:
 * - period: Time period (1D, 1W, 1M, 3M, 6M, 1Y, 2Y, 5Y)
 * - indicators: Comma-separated list of indicators (sma,ema,rsi,macd,volume)
 * - smaPeriod: SMA period (default: 20)
 * - emaPeriod: EMA period (default: 20)
 * - rsiPeriod: RSI period (default: 14)
 * - macdFast: MACD fast period (default: 12)
 * - macdSlow: MACD slow period (default: 26)
 * - macdSignal: MACD signal period (default: 9)
 */
export async function GET(
  request: NextRequest,
  { params }: HistoricalDataParams
): Promise<NextResponse<HistoricalDataResponse>> {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Missing required path parameter: symbol' },
        { status: 400 }
      );
    }

    // Validate symbol format
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!/^[A-Z0-9.\-^]+$/.test(cleanSymbol)) {
      return NextResponse.json(
        { success: false, error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1Y';
    const requestedIndicators = searchParams.get('indicators')?.split(',') || [];

    // Get period days
    const days = PERIOD_DAYS[period.toUpperCase()] || 365;

    // TODO: In production, fetch real historical data from API
    // For now, generate simulated data
    const historicalData = generateSimulatedHistoricalData(cleanSymbol, days);

    // Build indicator configurations from query params
    const indicators: IndicatorConfig[] = DEFAULT_INDICATORS.map(indicator => {
      const enabled = requestedIndicators.includes(indicator.type);
      const config: IndicatorConfig = { ...indicator, enabled };

      // Override default parameters if provided
      if (indicator.type === 'sma') {
        const period = searchParams.get('smaPeriod');
        if (period) config.params.period = parseInt(period, 10);
      } else if (indicator.type === 'ema') {
        const period = searchParams.get('emaPeriod');
        if (period) config.params.period = parseInt(period, 10);
      } else if (indicator.type === 'rsi') {
        const period = searchParams.get('rsiPeriod');
        if (period) config.params.period = parseInt(period, 10);
      } else if (indicator.type === 'macd') {
        const fast = searchParams.get('macdFast');
        const slow = searchParams.get('macdSlow');
        const signal = searchParams.get('macdSignal');
        if (fast) config.params.fastPeriod = parseInt(fast, 10);
        if (slow) config.params.slowPeriod = parseInt(slow, 10);
        if (signal) config.params.signalPeriod = parseInt(signal, 10);
      }

      return config;
    });

    // Always include volume
    if (!requestedIndicators.includes('volume')) {
      requestedIndicators.push('volume');
    }

    // Calculate indicators
    const indicatorData = calculateIndicators(historicalData, indicators);

    const responseData: ChartData = {
      candlestick: historicalData,
      indicators: indicatorData,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Historical data error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}