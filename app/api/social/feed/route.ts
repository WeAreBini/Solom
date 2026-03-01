import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { FeedResponse, FeedType } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/feed
 * 
 * Get a feed of trade ideas
 * Query params:
 * - type: 'trending' | 'following' | 'foryou' (default: 'trending')
 * - cursor: Pagination cursor
 * - limit: Number of results (default 20, max 50)
 * - ticker: Filter by ticker symbol
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') as FeedType) || 'trending';
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const ticker = searchParams.get('ticker')?.toUpperCase();
    const currentUserId = request.headers.get('x-user-id');

    // Build where clause based on feed type
    const where: Record<string, unknown> = {
      visibility: 'PUBLIC',
      status: 'ACTIVE',
    };

    // If 'following' type, get ideas from followed users
    if (type === 'following' && currentUserId) {
      // Get list of users the current user follows
      const follows = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      
      const followingIds = follows.map(f => f.followingId);
      
      // Include current user's ideas as well
      if (currentUserId) {
        followingIds.push(currentUserId);
      }
      
      where.authorId = { in: followingIds };
      // Remove public visibility constraint for following feed
      delete where.visibility;
    }

    // Filter by ticker if provided
    if (ticker) {
      where.tickers = { has: ticker };
    }

    // Get ideas with author info
    const ideas = await prisma.tradeIdea.findMany({
      where,
      orderBy: type === 'trending' 
        ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
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
            location: true,
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
      author: {
        ...idea.author,
        bio: idea.author.bio ?? null,
        website: idea.author.website ?? null,
        location: idea.author.location ?? null,
        winRate: idea.author.winRate ?? null,
        avgReturn: idea.author.avgReturn ?? null,
        brokerageName: idea.author.brokerageName ?? null,
      },
      isLiked: likedIdeaIds.includes(idea.id),
      isBookmarked: bookmarkedIdeaIds.includes(idea.id),
    }));

    const response: FeedResponse = {
      ideas: formattedIdeas,
      nextCursor: hasMore ? ideasToReturn[ideasToReturn.length - 1]?.id || null : null,
      hasMore,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Feed fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}