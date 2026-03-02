import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface FundamentalsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse<FundamentalsResponse>> {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Missing required path parameter: symbol' },
        { status: 400 }
      );
    }

    const cleanSymbol = symbol.toUpperCase().trim();
    if (!/^[A-Z0-9.\-^]+$/.test(cleanSymbol)) {
      return NextResponse.json(
        { success: false, error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        fundamentals: true,
      },
    });

    if (!asset || !asset.fundamentals) {
      return NextResponse.json(
        { success: false, error: `Fundamentals not found for symbol: ${cleanSymbol}` },
        { status: 404 }
      );
    }

    const { fundamentals } = asset;

    // Convert BigInt to Number for JSON serialization
    const data = {
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      exchange: asset.exchange,
      sector: fundamentals.sector,
      industry: fundamentals.industry,
      marketCap: fundamentals.marketCap ? Number(fundamentals.marketCap) : null,
      peRatio: fundamentals.peRatio,
      dividendYield: fundamentals.dividendYield,
      eps: fundamentals.eps,
      beta: fundamentals.beta,
      fiftyTwoWeekHigh: fundamentals.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: fundamentals.fiftyTwoWeekLow,
      description: fundamentals.description,
      updatedAt: fundamentals.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Fundamentals error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
