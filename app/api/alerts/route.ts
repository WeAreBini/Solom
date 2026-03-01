import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Default user ID for demo (in production, this would come from auth)
const DEFAULT_USER_ID = 'demo-user';

interface AlertResponse {
  success: boolean;
  data?: {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: string;
    status: string;
    createdAt: string;
  }[];
  error?: string;
  count: number;
}

interface CreateAlertBody {
  symbol: string;
  targetPrice: number;
  condition?: 'ABOVE' | 'BELOW';
}

// GET /api/alerts - Get all active alerts for user
export async function GET(): Promise<NextResponse<AlertResponse>> {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        status: { in: ['ACTIVE', 'TRIGGERED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: alerts.map((alert: { id: string; symbol: string; targetPrice: number; condition: string; status: string; createdAt: Date }) => ({
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        status: alert.status,
        createdAt: alert.createdAt.toISOString(),
      })),
      count: alerts.length,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
        count: 0,
      },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new price alert
export async function POST(request: NextRequest): Promise<NextResponse<AlertResponse>> {
  try {
    const body: CreateAlertBody = await request.json();
    
    if (!body.symbol || !body.targetPrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: symbol and targetPrice',
          count: 0,
        },
        { status: 400 }
      );
    }

    const condition = body.condition || 'ABOVE';
    
    if (condition !== 'ABOVE' && condition !== 'BELOW') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid condition. Must be ABOVE or BELOW',
          count: 0,
        },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: DEFAULT_USER_ID,
        symbol: body.symbol.toUpperCase(),
        targetPrice: body.targetPrice,
        condition: condition,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      data: [{
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        status: alert.status,
        createdAt: alert.createdAt.toISOString(),
      }],
      count: 1,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
        count: 0,
      },
      { status: 500 }
    );
  }
}