import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { CreateIdeaBody } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/ideas
 * 
 * Get a list of trade ideas
 * Query params:
 * - authorId: Filter by author
 * - ticker: Filter by ticker
 * - cursor: Pagination cursor
 * - limit: Number of results (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get('authorId') || undefined;
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const currentUserId = request.headers.get('x-user-id');

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    // If not viewing own ideas, only show public
    if (authorId && authorId !== currentUserId) {
      where.visibility = 'PUBLIC';
    } else if (!authorId) {
      where.visibility = 'PUBLIC';
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (ticker) {
      where.tickers = { has: ticker };
    }

    const ideas = await prisma.tradeIdea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
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

    const hasMore = ideas.length > limit;
    const ideasToReturn = hasMore ? ideas.slice(0, -1) : ideas;

    // Get like and bookmark status for current user
    let likedIdeaIds: string[] = [];
    let bookmarkedIdeaIds: string[] = [];

    if (currentUserId && ideasToReturn.length > 0) {
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({
          where: {
            userId: currentUserId,
            ideaId: { in: ideasToReturn.map(i => i.id) },
          },
          select: { ideaId: true },
        }),
        prisma.bookmark.findMany({
          where: {
            userId: currentUserId,
            ideaId: { in: ideasToReturn.map(i => i.id) },
          },
          select: { ideaId: true },
        }),
      ]);
      likedIdeaIds = likes.map(l => l.ideaId);
      bookmarkedIdeaIds = bookmarks.map(b => b.ideaId);
    }

    // Format response
    const formattedIdeas = ideasToReturn.map(idea => ({
      ...idea,
      charts: idea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
      isLiked: likedIdeaIds.includes(idea.id),
      isBookmarked: bookmarkedIdeaIds.includes(idea.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ideas: formattedIdeas,
        nextCursor: hasMore ? ideasToReturn[ideasToReturn.length - 1]?.id || null : null,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Ideas fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/ideas
 * 
 * Create a new trade idea
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

    const body: CreateIdeaBody = await request.json();

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!body.tickers || body.tickers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one ticker is required' },
        { status: 400 }
      );
    }

    // Validate tickers (uppercase, max 5 characters)
    const validatedTickers = body.tickers
      .map(t => t.toUpperCase().slice(0, 5))
      .slice(0, 10); // Max 10 tickers

    // Ensure user profile exists
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: currentUserId },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: { userId: currentUserId },
      });
    }

    // Create the idea
    const idea = await prisma.tradeIdea.create({
      data: {
        authorId: currentUserId,
        content: body.content.trim(),
        title: body.title?.trim() || null,
        tickers: validatedTickers,
        entryPrice: body.entryPrice ?? null,
        targetPrice: body.targetPrice ?? null,
        stopLoss: body.stopLoss ?? null,
        positionSize: body.positionSize ?? null,
        timeframe: body.timeframe ?? null,
        direction: body.direction ?? null,
        charts: body.charts as unknown as object[] ?? null,
        thesis: body.thesis?.trim() || null,
        visibility: body.visibility || 'PUBLIC',
      },
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

    // Update user's ideas count
    await prisma.userProfile.update({
      where: { userId: currentUserId },
      data: { ideasCount: { increment: 1 } },
    });

    // Create notifications for followers
    const followers = await prisma.follow.findMany({
      where: { followingId: currentUserId },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      await prisma.socialNotification.createMany({
        data: followers.map(f => ({
          userId: f.followerId,
          type: 'NEW_IDEA',
          title: 'New Trade Idea',
          body: `${userProfile.displayName || 'Someone'} shared a new trade idea`,
          data: { ideaId: idea.id },
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...idea,
        charts: idea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
        isLiked: false,
        isBookmarked: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Idea creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}