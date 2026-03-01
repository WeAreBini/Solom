import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Default user ID for demo (in production, this would come from auth)
const DEFAULT_USER_ID = 'demo-user';

interface WatchlistResponse {
  success: boolean;
  data?: {
    symbol: string;
    addedAt: string;
  }[];
  error?: string;
  count: number;
}

// GET /api/watchlist - Get user's watchlist
export async function GET(): Promise<NextResponse<WatchlistResponse>> {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: watchlist.map(item => ({
        symbol: item.symbol,
        addedAt: item.addedAt.toISOString(),
      })),
      count: watchlist.length,
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch watchlist',
        count: 0,
      },
      { status: 500 }
    );
  }
}

// POST /api/watchlist - Add stock to watchlist
export async function POST(request: NextRequest): Promise<NextResponse<WatchlistResponse>> {
  try {
    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: symbol',
          count: 0,
        },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.watchlist.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        symbol: symbol.toUpperCase(),
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: [{
          symbol: existing.symbol,
          addedAt: existing.addedAt.toISOString(),
        }],
        count: 1,
      });
    }

    // Add to watchlist
    const item = await prisma.watchlist.create({
      data: {
        userId: DEFAULT_USER_ID,
        symbol: symbol.toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      data: [{
        symbol: item.symbol,
        addedAt: item.addedAt.toISOString(),
      }],
      count: 1,
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add to watchlist',
        count: 0,
      },
      { status: 500 }
    );
  }
}