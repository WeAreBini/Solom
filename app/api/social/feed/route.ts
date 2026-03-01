// @ts-nocheck — Social models (TradeIdea, UserProfile, etc.) not yet in Prisma schema
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { FeedResponse, FeedType, TradeIdeaWithMetrics } from '@/lib/types/social';

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
          },
        },
      },
    });

    const hasMore = ideas.length > limit;
    const ideasToReturn = hasMore ? ideas.slice(0, -1) : ideas;

    // Get like status for current user
    let likedIdeaIds: string[] = [];
    if (currentUserId) {
      const likes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          ideaId: { in: ideasToReturn.map(i => i.id) },
        },
        select: { ideaId: true },
      });
      likedIdeaIds = likes.map(l => l.ideaId);
    }

    // Format response
    const formattedIdeas: TradeIdeaWithMetrics[] = ideasToReturn.map(idea => ({
      ...idea,
      charts: idea.charts as unknown as import('@/lib/types/social').ChartAttachment[] | null,
      author: {
        id: idea.author.id,
        userId: idea.author.userId,
        displayName: idea.author.displayName,
        avatarUrl: idea.author.avatarUrl,
        verificationTier: idea.author.verificationTier,
        isVerified: idea.author.isVerified,
        followersCount: idea.author.followersCount,
        followingCount: idea.author.followingCount ?? 0,
        ideasCount: idea.author.ideasCount,
        bio: idea.author.bio ?? null,
        website: idea.author.website ?? null,
        winRate: idea.author.winRate ?? null,
        avgReturn: idea.author.avgReturn ?? null,
        brokerageConnected: idea.author.brokerageConnected ?? false,
        brokerageName: idea.author.brokerageName ?? null,
        createdAt: idea.author.createdAt,
        updatedAt: idea.author.updatedAt,
      },
      isLiked: likedIdeaIds.includes(idea.id),
      isBookmarked: false, // TODO: Implement bookmarks
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