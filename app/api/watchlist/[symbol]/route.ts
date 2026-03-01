import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_USER_ID = 'demo-user';

interface WatchlistResponse {
  success: boolean;
  data?: {
    symbol: string;
    removedAt: string;
  };
  error?: string;
}

// DELETE /api/watchlist/[symbol] - Remove stock from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse<WatchlistResponse>> {
  try {
    const { symbol } = await params;

    const item = await prisma.watchlist.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        symbol: symbol.toUpperCase(),
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stock not found in watchlist',
        },
        { status: 404 }
      );
    }

    await prisma.watchlist.delete({
      where: { id: item.id },
    });

    // Also delete any associated alerts
    await prisma.priceAlert.deleteMany({
      where: {
        userId: DEFAULT_USER_ID,
        symbol: symbol.toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        removedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove from watchlist',
      },
      { status: 500 }
    );
  }
}