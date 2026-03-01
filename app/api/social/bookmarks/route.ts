import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/bookmarks
 * 
 * Get bookmarked ideas for the current user
 * Query params:
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
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get bookmarks with idea details
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        idea: {
          include: {
            author: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                avatarUrl: true,
                verificationTier: true,
                isVerified: true,
                followersCount: true,
                followingCount: true,
                ideasCount: true,
                bio: true,
                website: true,
                winRate: true,
                avgReturn: true,
                brokerageConnected: true,
                brokerageName: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const hasMore = bookmarks.length > limit;
    const bookmarksToReturn = hasMore ? bookmarks.slice(0, -1) : bookmarks;

    // Format response
    const ideas = bookmarksToReturn.map(bookmark => ({
      ...bookmark.idea,
      charts: bookmark.idea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
      bookmarkedAt: bookmark.createdAt,
      isLiked: false, // Will be computed client-side
      isBookmarked: true,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ideas,
        nextCursor: hasMore ? bookmarksToReturn[bookmarksToReturn.length - 1]?.id || null : null,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/bookmarks
 * 
 * Bookmark an idea
 * Body:
 * - ideaId: The ID of the idea to bookmark
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
    const { ideaId } = body;

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    // Verify idea exists
    const idea = await prisma.tradeIdea.findUnique({
      where: { id: ideaId },
      select: { id: true },
    });

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_ideaId: { userId: currentUserId, ideaId },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { success: false, error: 'Already bookmarked' },
        { status: 400 }
      );
    }

    // Ensure user profile exists
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: currentUserId },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: { userId: currentUserId },
      });
    }

    // Create bookmark and update count in transaction
    await prisma.$transaction([
      prisma.bookmark.create({
        data: {
          userId: currentUserId,
          ideaId,
        },
      }),
      prisma.tradeIdea.update({
        where: { id: ideaId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { bookmarked: true },
    });
  } catch (error) {
    console.error('Bookmark creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bookmark idea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/bookmarks
 * 
 * Remove a bookmark
 * Body:
 * - ideaId: The ID of the idea to unbookmark
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
    const { ideaId } = body;

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    // Check if bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_ideaId: { userId: currentUserId, ideaId },
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { success: false, error: 'Not bookmarked' },
        { status: 400 }
      );
    }

    // Remove bookmark and update count in transaction
    await prisma.$transaction([
      prisma.bookmark.delete({
        where: {
          userId_ideaId: { userId: currentUserId, ideaId },
        },
      }),
      prisma.tradeIdea.update({
        where: { id: ideaId },
        data: { bookmarkCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { bookmarked: false },
    });
  } catch (error) {
    console.error('Unbookmark error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}