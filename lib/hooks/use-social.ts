/**
 * React Query hooks for Social Trading features
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type {
  FeedType,
  FeedResponse,
  UserProfile,
  CreateProfileBody,
  UpdateProfileBody,
  TradeIdeaWithMetrics,
  CreateIdeaBody,
  UpdateIdeaBody,
  Comment,
  CreateCommentBody,
  SocialNotification,
  NotificationsResponse,
} from '@/lib/types/social';
import { socialKeys } from '@/lib/types/social';

// ============================================
// API Helper Functions
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data;
}

// ============================================
// Profile Hooks
// ============================================

/**
 * Hook to get the current user's profile
 */
export function useProfile(userId?: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: userId ? socialKeys.profile(userId) : socialKeys.myProfile(),
    queryFn: () => fetchApi<UserProfile>(
      userId ? `/api/social/profile?userId=${userId}` : '/api/social/profile'
    ),
    enabled: mounted,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileBody) =>
      fetchApi<UserProfile>('/api/social/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(socialKeys.myProfile(), data);
    },
  });
}

// ============================================
// Feed Hooks
// ============================================

/**
 * Hook to get the social feed
 */
export function useFeed(type: FeedType = 'trending', ticker?: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: socialKeys.feed(type, ticker),
    queryFn: () => {
      const params = new URLSearchParams({ type });
      if (ticker) params.append('ticker', ticker);
      return fetchApi<FeedResponse>(`/api/social/feed?${params}`);
    },
    enabled: mounted,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// Trade Ideas Hooks
// ============================================

/**
 * Hook to get a single trade idea
 */
export function useIdea(ideaId: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: socialKeys.idea(ideaId),
    queryFn: () => fetchApi<TradeIdeaWithMetrics>(`/api/social/ideas/${ideaId}`),
    enabled: mounted && !!ideaId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get a user's trade ideas
 */
export function useUserIdeas(userId: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: socialKeys.ideas(userId),
    queryFn: () =>
      fetchApi<{ ideas: TradeIdeaWithMetrics[]; hasMore: boolean }>(
        `/api/social/ideas?authorId=${userId}`
      ),
    enabled: mounted && !!userId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to create a trade idea
 */
export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateIdeaBody) =>
      fetchApi<TradeIdeaWithMetrics>('/api/social/ideas', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // Invalidate all feed queries
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'ideas'] });
    },
  });
}

/**
 * Hook to update a trade idea
 */
export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateIdeaBody }) =>
      fetchApi<TradeIdeaWithMetrics>(`/api/social/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.idea(id) });
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'ideas'] });
    },
  });
}

/**
 * Hook to delete a trade idea
 */
export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ deleted: boolean }>(`/api/social/ideas/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'ideas'] });
    },
  });
}

// ============================================
// Like Hooks
// ============================================

/**
 * Hook to like/unlike an idea
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ideaId, isLiked }: { ideaId: string; isLiked: boolean }) => {
      if (isLiked) {
        return fetchApi<{ liked: false; likeCount: number }>(
          `/api/social/ideas/${ideaId}/like`,
          { method: 'DELETE' }
        );
      } else {
        return fetchApi<{ liked: true; likeCount: number }>(
          `/api/social/ideas/${ideaId}/like`,
          { method: 'POST' }
        );
      }
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.idea(ideaId) });
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

// ============================================
// Comment Hooks
// ============================================

/**
 * Hook to get comments for an idea
 */
export function useComments(ideaId: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: ['social', 'comments', ideaId],
    queryFn: () =>
      fetchApi<{ comments: Comment[]; hasMore: boolean }>(
        `/api/social/ideas/${ideaId}/comments`
      ),
    enabled: mounted && !!ideaId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ideaId,
      body,
    }: {
      ideaId: string;
      body: CreateCommentBody;
    }) =>
      fetchApi<Comment>(`/api/social/ideas/${ideaId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ['social', 'comments', ideaId],
      });
      queryClient.invalidateQueries({ queryKey: socialKeys.idea(ideaId) });
    },
  });
}

// ============================================
// Follow Hooks
// ============================================

/**
 * Hook to get followers/following for a user
 */
export function useFollows(userId: string, type: 'followers' | 'following' = 'following') {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: type === 'followers' ? socialKeys.followers(userId) : socialKeys.following(userId),
    queryFn: () =>
      fetchApi<{
        users: Array<{
          id: string;
          userId: string;
          displayName: string | null;
          avatarUrl: string | null;
          verificationTier: string;
          isVerified: boolean;
          followersCount: number;
          ideasCount: number;
          followedAt: string;
        }>;
        hasMore: boolean;
        followersCount: number;
        followingCount: number;
        isFollowing: boolean;
      }>(`/api/social/users/${userId}/follow?type=${type}`),
    enabled: mounted && !!userId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to follow/unfollow a user
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isFollowing,
    }: {
      targetUserId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        return fetchApi<{ following: false }>(
          `/api/social/users/${targetUserId}/follow`,
          { method: 'DELETE' }
        );
      } else {
        return fetchApi<{ following: true }>(
          `/api/social/users/${targetUserId}/follow`,
          { method: 'POST' }
        );
      }
    },
    onSuccess: (_, { targetUserId }) => {
      queryClient.invalidateQueries({
        queryKey: ['social', 'followers', targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['social', 'following', targetUserId],
      });
      queryClient.invalidateQueries({ queryKey: socialKeys.profile(targetUserId) });
    },
  });
}

// ============================================
// Bookmark Hooks
// ============================================

/**
 * Hook to get bookmarked ideas
 */
export function useBookmarks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: socialKeys.bookmarks(),
    queryFn: () =>
      fetchApi<{ ideas: TradeIdeaWithMetrics[]; hasMore: boolean }>(
        '/api/social/bookmarks'
      ),
    enabled: mounted,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to toggle a bookmark
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ideaId,
      isBookmarked,
    }: {
      ideaId: string;
      isBookmarked: boolean;
    }) => {
      if (isBookmarked) {
        return fetchApi<{ bookmarked: false }>(
          '/api/social/bookmarks',
          {
            method: 'DELETE',
            body: JSON.stringify({ ideaId }),
          }
        );
      } else {
        return fetchApi<{ bookmarked: true }>(
          '/api/social/bookmarks',
          {
            method: 'POST',
            body: JSON.stringify({ ideaId }),
          }
        );
      }
    },
    onSuccess: (_, { ideaId }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.idea(ideaId) });
      queryClient.invalidateQueries({ queryKey: socialKeys.bookmarks() });
      queryClient.invalidateQueries({ queryKey: ['social', 'feed'] });
    },
  });
}

// ============================================
// Notification Hooks
// ============================================

/**
 * Hook to get notifications
 */
export function useNotifications(unreadOnly: boolean = false) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery({
    queryKey: [...socialKeys.notifications(), unreadOnly],
    queryFn: () => {
      const params = unreadOnly ? '?unreadOnly=true' : '';
      return fetchApi<NotificationsResponse>(
        `/api/social/notifications${params}`
      );
    },
    enabled: mounted,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to mark notifications as read
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) =>
      fetchApi<{ updated: number }>('/api/social/notifications', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.notifications() });
    },
  });
}

/**
 * Hook to delete notifications
 */
export function useDeleteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) =>
      fetchApi<{ deleted: number }>('/api/social/notifications', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.notifications() });
    },
  });
}