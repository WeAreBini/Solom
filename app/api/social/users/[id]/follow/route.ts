import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface FollowUserResult {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  verificationTier: string;
  isVerified: boolean;
  followersCount: number;
  ideasCount: number;
  followedAt: Date;
}

/**
 * GET /api/social/users/[id]/follow
 * 
 * Get follow status between current user and target user
 * Query params:
 * - type: 'followers' | 'following' (default: 'following')
 * - cursor: Pagination cursor
 * - limit: Number of results (default 20, max 50)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: targetUserId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') as 'followers' | 'following') || 'following';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const currentUserId = request.headers.get('x-user-id');

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && type === 'followers') {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // Find follows based on type
    const where = type === 'followers'
      ? { followingId: targetUserId }
      : { followerId: targetUserId };

    const follows = await prisma.follow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        follower: type === 'followers' ? {
          select: {
            id: true,
            userId: true,
            displayName: true,
            avatarUrl: true,
            verificationTier: true,
            isVerified: true,
            followersCount: true,
            ideasCount: true,
          },
        } : undefined,
        following: type === 'following' ? {
          select: {
            id: true,
            userId: true,
            displayName: true,
            avatarUrl: true,
            verificationTier: true,
            isVerified: true,
            followersCount: true,
            ideasCount: true,
          },
        } : undefined,
      },
    });

    const hasMore = follows.length > limit;
    const followsToReturn = hasMore ? follows.slice(0, -1) : follows;

    // Format response based on type
    const users: FollowUserResult[] = followsToReturn
      .filter(follow => {
        const user = type === 'followers' ? follow.follower : follow.following;
        return user !== null;
      })
      .map(follow => {
        const user = type === 'followers' ? follow.follower : follow.following;
        return {
          id: user!.id,
          userId: user!.userId,
          displayName: user!.displayName,
          avatarUrl: user!.avatarUrl,
          verificationTier: user!.verificationTier,
          isVerified: user!.isVerified,
          followersCount: user!.followersCount,
          ideasCount: user!.ideasCount,
          followedAt: follow.createdAt,
        };
      });

    // Get counts
    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: targetUserId },
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        nextCursor: hasMore ? followsToReturn[followsToReturn.length - 1]?.id || null : null,
        hasMore,
        followersCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Follow fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/users/[id]/follow
 * 
 * Follow a user
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: targetUserId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cannot follow self
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetProfile = await prisma.userProfile.findUnique({
      where: { userId: targetUserId },
    });

    if (!targetProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Already following' },
        { status: 400 }
      );
    }

    // Ensure current user profile exists
    let currentUserProfile = await prisma.userProfile.findUnique({
      where: { userId: currentUserId },
    });

    if (!currentUserProfile) {
      currentUserProfile = await prisma.userProfile.create({
        data: { userId: currentUserId },
      });
    }

    // Create follow and update counts in transaction
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      }),
      // Increment following count for follower
      prisma.userProfile.update({
        where: { userId: currentUserId },
        data: { followingCount: { increment: 1 } },
      }),
      // Increment followers count for following
      prisma.userProfile.update({
        where: { userId: targetUserId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    // Create notification for the followed user
    await prisma.socialNotification.create({
      data: {
        userId: targetUserId,
        type: 'NEW_FOLLOWER',
        title: 'New Follower',
        body: `${currentUserProfile.displayName || 'Someone'} started following you`,
        data: { followerId: currentUserId },
      },
    });

    return NextResponse.json({
      success: true,
      data: { following: true },
    });
  } catch (error) {
    console.error('Follow creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/users/[id]/follow
 * 
 * Unfollow a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: targetUserId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Not following this user' },
        { status: 400 }
      );
    }

    // Remove follow and update counts in transaction
    await prisma.$transaction([
      prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      }),
      // Decrement following count for follower
      prisma.userProfile.update({
        where: { userId: currentUserId },
        data: { followingCount: { decrement: 1 } },
      }),
      // Decrement followers count for following
      prisma.userProfile.update({
        where: { userId: targetUserId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { following: false },
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}