import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_USER_ID = 'demo-user';

interface AlertResponse {
  success: boolean;
  data?: {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: string;
    status: string;
    updatedAt: string;
  };
  error?: string;
}

// DELETE /api/alerts/[id] - Delete an alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AlertResponse>> {
  try {
    const { id } = await params;

    const alert = await prisma.priceAlert.findFirst({
      where: {
        id,
        userId: DEFAULT_USER_ID,
      },
    });

    if (!alert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    // Soft delete by setting status to DELETED
    await prisma.priceAlert.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        status: 'DELETED',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts/[id] - Update alert status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AlertResponse>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'DISABLED', 'TRIGGERED'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be ACTIVE, DISABLED, or TRIGGERED',
        },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.findFirst({
      where: {
        id,
        userId: DEFAULT_USER_ID,
      },
    });

    if (!alert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    const updated = await prisma.priceAlert.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        symbol: updated.symbol,
        targetPrice: updated.targetPrice,
        condition: updated.condition,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert',
      },
      { status: 500 }
    );
  }
}