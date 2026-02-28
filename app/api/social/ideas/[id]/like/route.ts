import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/social/ideas/[id]/like
 * 
 * Check if the current user has liked this idea
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: ideaId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_ideaId: { userId: currentUserId, ideaId },
      },
    });

    return NextResponse.json({
      success: true,
      data: { isLiked: !!like },
    });
  } catch (error) {
    console.error('Like check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/ideas/[id]/like
 * 
 * Like a trade idea
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: ideaId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify idea exists
    const idea = await prisma.tradeIdea.findUnique({
      where: { id: ideaId },
      select: { id: true, authorId: true },
    });

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_ideaId: { userId: currentUserId, ideaId },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Already liked' },
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

    // Create like and update count in transaction
    await prisma.$transaction([
      prisma.like.create({
        data: {
          userId: currentUserId,
          ideaId,
        },
      }),
      prisma.tradeIdea.update({
        where: { id: ideaId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    // Create notification for idea author (if not self)
    if (idea.authorId !== currentUserId) {
      await prisma.notification.create({
        data: {
          userId: idea.authorId,
          type: 'NEW_IDEA',
          title: 'New Like',
          body: `${userProfile.displayName || 'Someone'} liked your idea`,
          data: { ideaId },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { liked: true },
    });
  } catch (error) {
    console.error('Like creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like idea' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/ideas/[id]/like
 * 
 * Unlike a trade idea
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: ideaId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_ideaId: { userId: currentUserId, ideaId },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { success: false, error: 'Not liked' },
        { status: 400 }
      );
    }

    // Remove like and update count in transaction
    await prisma.$transaction([
      prisma.like.delete({
        where: {
          userId_ideaId: { userId: currentUserId, ideaId },
        },
      }),
      prisma.tradeIdea.update({
        where: { id: ideaId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { liked: false },
    });
  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike idea' },
      { status: 500 }
    );
  }
}