// @ts-nocheck — Social models (TradeIdea, etc.) not yet in Prisma schema
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { CreateIdeaRequest, TradeIdea } from '@/lib/types/social';

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

    // Build where clause
    const where: Record<string, unknown> = {
      visibility: 'PUBLIC',
      status: 'ACTIVE',
    };

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
            ideasCount: true,
            winRate: true,
            avgReturn: true,
          },
        },
      },
    });

    const hasMore = ideas.length > limit;
    const ideasToReturn = hasMore ? ideas.slice(0, -1) : ideas;

    return NextResponse.json({
      success: true,
      data: {
        ideas: ideasToReturn,
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

    const body: CreateIdeaRequest = await request.json();

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
        entryPrice: body.entryPrice || null,
        targetPrice: body.targetPrice || null,
        stopLoss: body.stopLoss || null,
        positionSize: body.positionSize || null,
        timeframe: body.timeframe || null,
        direction: body.direction || null,
        charts: body.charts as unknown as undefined,
        thesis: body.thesis?.trim() || null,
        visibility: body.visibility || 'PUBLIC',
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
      await prisma.notification.createMany({
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
      data: idea,
    }, { status: 201 });
  } catch (error) {
    console.error('Idea creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}