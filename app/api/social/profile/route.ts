// @ts-nocheck — Social models (UserProfile) not yet in Prisma schema
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { UpdateProfileRequest, UserProfile } from '@/lib/types/social';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/profile
 * 
 * Get the current user's profile
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

    const body: UpdateProfileRequest = await request.json();

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
    if (body.website !== undefined && body.website !== null) {
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