import { NextRequest, NextResponse } from 'next/server';
import { ingestAssetProfile, ingestHistoricalData } from '@/lib/ingestion/market-data';

// Helper to serialize BigInt for JSON responses
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj.toISOString();
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }
  return obj;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol } = body;

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid symbol string is required' },
        { status: 400 }
      );
    }

    const sanitizedSymbol = symbol.toUpperCase().trim();

    // 1. Ingest Asset Profile
    const profileResult = await ingestAssetProfile(sanitizedSymbol);

    // 2. Ingest Historical Data (5 years back)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const historicalResult = await ingestHistoricalData(sanitizedSymbol, fiveYearsAgo);

    const data = {
      profile: profileResult,
      historical: historicalResult,
    };

    return NextResponse.json(
      { success: true, data: serializeBigInt(data) },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Ingestion API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
