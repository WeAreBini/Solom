import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { UpdateIdeaBody } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/social/ideas/[id]
 * 
 * Get a single trade idea by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const currentUserId = request.headers.get('x-user-id');

    const idea = await prisma.tradeIdea.findUnique({
      where: { id },
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
    });

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check visibility permissions
    if (idea.visibility === 'PRIVATE' && idea.authorId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    if (idea.visibility === 'FOLLOWERS' && idea.authorId !== currentUserId) {
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        );
      }
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: currentUserId, followingId: idea.authorId },
        },
      });
      if (!isFollowing) {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        );
      }
    }

    // Increment view count
    await prisma.tradeIdea.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Get like and bookmark status
    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_ideaId: { userId: currentUserId, ideaId: id } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_ideaId: { userId: currentUserId, ideaId: id } },
        }),
      ]);
      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...idea,
        charts: idea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
        isLiked,
        isBookmarked,
      },
    });
  } catch (error) {
    console.error('Idea fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social/ideas/[id]
 * 
 * Update a trade idea
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idea = await prisma.tradeIdea.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    if (idea.authorId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this idea' },
        { status: 403 }
      );
    }

    const body: UpdateIdeaBody = await request.json();

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.title !== undefined) updateData.title = body.title?.trim() || null;
    if (body.tickers !== undefined) updateData.tickers = body.tickers.map(t => t.toUpperCase().slice(0, 5)).slice(0, 10);
    if (body.entryPrice !== undefined) updateData.entryPrice = body.entryPrice;
    if (body.targetPrice !== undefined) updateData.targetPrice = body.targetPrice;
    if (body.stopLoss !== undefined) updateData.stopLoss = body.stopLoss;
    if (body.positionSize !== undefined) updateData.positionSize = body.positionSize;
    if (body.timeframe !== undefined) updateData.timeframe = body.timeframe;
    if (body.direction !== undefined) updateData.direction = body.direction;
    if (body.thesis !== undefined) updateData.thesis = body.thesis?.trim() || null;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.charts !== undefined) updateData.charts = body.charts as unknown as object[];
    
    // Handle status changes
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'CLOSED' || body.status === 'INVALIDATED') {
        updateData.closedAt = new Date();
        updateData.closeReason = body.closeReason || null;
      }
    }

    const updatedIdea = await prisma.tradeIdea.update({
      where: { id },
      data: updateData,
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
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedIdea,
        charts: updatedIdea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
        isLiked: false, // Will be computed client-side
        isBookmarked: false,
      },
    });
  } catch (error) {
    console.error('Idea update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/ideas/[id]
 * 
 * Delete a trade idea
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idea = await prisma.tradeIdea.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    if (idea.authorId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this idea' },
        { status: 403 }
      );
    }

    // Delete idea (cascades to likes, comments, bookmarks)
    await prisma.tradeIdea.delete({
      where: { id },
    });

    // Update user's ideas count
    await prisma.userProfile.update({
      where: { userId: currentUserId },
      data: { ideasCount: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Idea delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}