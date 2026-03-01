// @ts-nocheck — Social models not yet in Prisma schema
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { CreateCommentRequest, CommentWithAuthor } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/social/ideas/[id]/comments
 * 
 * Get comments for a trade idea
 * Query params:
 * - cursor: Pagination cursor
 * - limit: Number of results (default 20, max 50)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: ideaId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

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

    // Fetch comments with author info
    const comments = await prisma.comment.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
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
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;

    // Build nested comment structure
    const commentMap = new Map<string, CommentWithAuthor>();
    const rootComments: CommentWithAuthor[] = [];

    // First pass: create map of all comments
    commentsToReturn.forEach(comment => {
      const commentWithAuthor: CommentWithAuthor = {
        ...comment,
        author: {
          id: comment.author.id,
          userId: comment.author.userId,
          displayName: comment.author.displayName,
          avatarUrl: comment.author.avatarUrl,
          verificationTier: comment.author.verificationTier,
          isVerified: comment.author.isVerified,
          followersCount: 0,
          ideasCount: 0,
          winRate: null,
          avgReturn: null,
          brokerageConnected: false,
          brokerageName: null,
          createdAt: comment.author.createdAt || new Date(),
          updatedAt: comment.author.updatedAt || new Date(),
        },
        replies: [],
      };
      commentMap.set(comment.id, commentWithAuthor);
    });

    // Second pass: build tree structure
    commentsToReturn.forEach(comment => {
      const commentWithAuthor = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithAuthor);
        }
      } else {
        rootComments.push(commentWithAuthor);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        comments: rootComments,
        nextCursor: hasMore ? commentsToReturn[commentsToReturn.length - 1]?.id || null : null,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/ideas/[id]/comments
 * 
 * Create a new comment on a trade idea
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

    const body: CreateCommentRequest = await request.json();

    // Validate content
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (body.content.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 5000 characters or less' },
        { status: 400 }
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

    // If replying to a parent comment, verify it exists
    if (body.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, ideaId: true },
      });

      if (!parentComment || parentComment.ideaId !== ideaId) {
        return NextResponse.json(
          { success: false, error: 'Parent comment not found' },
          { status: 404 }
        );
      }
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

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        ideaId,
        authorId: currentUserId,
        parentId: body.parentId || null,
        content: body.content.trim(),
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
          },
        },
      },
    });

    // Update comment count on idea
    await prisma.tradeIdea.update({
      where: { id: ideaId },
      data: { commentCount: { increment: 1 } },
    });

    // Create notification for idea author (if not self)
    if (idea.authorId !== currentUserId) {
      await prisma.notification.create({
        data: {
          userId: idea.authorId,
          type: 'COMMENT_REPLY',
          title: 'New Comment',
          body: `${userProfile.displayName || 'Someone'} commented on your idea`,
          data: { ideaId, commentId: comment.id },
        },
      });
    }

    // If it's a reply, notify the parent comment author (if not self and different from idea author)
    if (body.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { authorId: true },
      });

      if (parentComment && 
          parentComment.authorId !== currentUserId && 
          parentComment.authorId !== idea.authorId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            type: 'COMMENT_REPLY',
            title: 'Reply to Your Comment',
            body: `${userProfile.displayName || 'Someone'} replied to your comment`,
            data: { ideaId, commentId: comment.id, parentCommentId: body.parentId },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        author: {
          id: comment.author.id,
          userId: comment.author.userId,
          displayName: comment.author.displayName,
          avatarUrl: comment.author.avatarUrl,
          verificationTier: comment.author.verificationTier,
          isVerified: comment.author.isVerified,
          followersCount: 0,
          ideasCount: 0,
          winRate: null,
          avgReturn: null,
          brokerageConnected: false,
          brokerageName: null,
          createdAt: comment.author.createdAt || new Date(),
          updatedAt: comment.author.updatedAt || new Date(),
        },
        replies: [],
      },
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}