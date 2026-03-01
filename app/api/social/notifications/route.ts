import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { NotificationsQuery, NotificationsResponse, SocialNotification } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/notifications
 * 
 * Get notifications for the current user
 * Query params:
 * - unreadOnly: Only return unread notifications (default: false)
 * - cursor: Pagination cursor
 * - limit: Number of results (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Build where clause
    const where: Record<string, unknown> = {
      userId: currentUserId,
    };

    if (unreadOnly) {
      where.read = false;
    }

    // Get notifications
    const notifications = await prisma.socialNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = notifications.length > limit;
    const notificationsToReturn = hasMore ? notifications.slice(0, -1) : notifications;

    // Get unread count
    const unreadCount = await prisma.socialNotification.count({
      where: {
        userId: currentUserId,
        read: false,
      },
    });

    const response: NotificationsResponse = {
      notifications: notificationsToReturn.map(n => ({
        ...n,
        data: n.data as Record<string, unknown> | null,
      })),
      nextCursor: hasMore ? notificationsToReturn[notificationsToReturn.length - 1]?.id || null : null,
      hasMore,
      unreadCount,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/notifications
 * 
 * Mark notifications as read
 * Body:
 * - ids: Array of notification IDs to mark as read (optional, if empty marks all as read)
 */
export async function POST(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      await prisma.socialNotification.updateMany({
        where: {
          id: { in: ids },
          userId: currentUserId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { updated: ids.length },
      });
    } else {
      // Mark all as read
      const result = await prisma.socialNotification.updateMany({
        where: {
          userId: currentUserId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { updated: result.count },
      });
    }
  } catch (error) {
    console.error('Notifications update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/notifications
 * 
 * Delete notifications
 * Body:
 * - ids: Array of notification IDs to delete (optional, if empty deletes all read)
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Delete specific notifications
      await prisma.socialNotification.deleteMany({
        where: {
          id: { in: ids },
          userId: currentUserId,
        },
      });

      return NextResponse.json({
        success: true,
        data: { deleted: ids.length },
      });
    } else {
      // Delete all read notifications
      const result = await prisma.socialNotification.deleteMany({
        where: {
          userId: currentUserId,
          read: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: { deleted: result.count },
      });
    }
  } catch (error) {
    console.error('Notifications delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}