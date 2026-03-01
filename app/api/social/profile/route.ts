import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { UpdateProfileBody, UserProfile } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/profile
 * 
 * Get the current user's profile
 * Headers: x-user-id (required)
 * Query: userId (optional - get another user's profile)
 */
export async function GET(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');
    const requestedUserId = request.nextUrl.searchParams.get('userId');

    // If requesting another user's profile
    if (requestedUserId) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: requestedUserId },
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          website: true,
          location: true,
          isVerified: true,
          verificationTier: true,
          followersCount: true,
          followingCount: true,
          ideasCount: true,
          winRate: true,
          avgReturn: true,
          brokerageConnected: true,
          brokerageName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: profile,
      });
    }

    // Get current user's profile
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: currentUserId },
    });

    if (!profile) {
      // Create default profile
      const newProfile = await prisma.userProfile.create({
        data: { userId: currentUserId },
      });

      return NextResponse.json({
        success: true,
        data: newProfile,
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social/profile
 * 
 * Update the current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateProfileBody = await request.json();

    // Validate display name
    if (body.displayName !== undefined && body.displayName !== null) {
      if (body.displayName.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Display name must be 50 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate bio
    if (body.bio !== undefined && body.bio !== null) {
      if (body.bio.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Bio must be 500 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate website URL
    if (body.website !== undefined && body.website !== null && body.website !== '') {
      try {
        new URL(body.website);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid website URL' },
          { status: 400 }
        );
      }
    }

    // Ensure user profile exists
    let profile = await prisma.userProfile.findUnique({
      where: { userId: currentUserId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: currentUserId },
      });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.location !== undefined) updateData.location = body.location;

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: currentUserId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}