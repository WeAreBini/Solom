/**
 * TypeScript types for Social Trading feature
 * These types correspond to Prisma models in schema.prisma
 */

// ============================================
// Enums
// ============================================

export type VerificationTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type Timeframe = 'INTRADAY' | 'SWING' | 'POSITION';

export type TradeDirection = 'LONG' | 'SHORT' | 'NEUTRAL';

export type IdeaStatus = 'ACTIVE' | 'CLOSED' | 'INVALIDATED';

export type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export type SocialNotificationType =
  | 'NEW_IDEA'
  | 'NEW_FOLLOWER'
  | 'COMMENT_REPLY'
  | 'IDEA_LIKED'
  | 'IDEA_CLOSED'
  | 'MENTION'
  | 'PERFORMANCE_MILESTONE'
  | 'COPY_STARTED'
  | 'COPY_STOPPED';

export type CopyStatus = 'ACTIVE' | 'PAUSED' | 'STOPPED';

// ============================================
// Core Models
// ============================================

export interface UserProfile {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  isVerified: boolean;
  verificationTier: VerificationTier;
  followersCount: number;
  followingCount: number;
  ideasCount: number;
  winRate: number | null;
  avgReturn: number | null;
  brokerageConnected: boolean;
  brokerageName: string | null;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface ChartAttachment {
  url: string;
  caption?: string;
  type: 'image' | 'video';
}

export interface TradeIdea {
  id: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  content: string;
  tickers: string[];
  entryPrice: number | null;
  targetPrice: number | null;
  stopLoss: number | null;
  positionSize: number | null;
  timeframe: Timeframe | null;
  direction: TradeDirection | null;
  thesis: string | null;
  status: IdeaStatus;
  closedAt: Date | null;
  closeReason: string | null;
  visibility: Visibility;
  charts: ChartAttachment[] | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}

export interface TradeIdeaWithAuthor extends TradeIdea {
  author: UserProfile;
}

export interface TradeIdeaWithMetrics extends TradeIdeaWithAuthor {
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface Like {
  id: string;
  userId: string;
  ideaId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  author?: UserProfile;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  userId: string;
  ideaId: string;
  createdAt: Date;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: SocialNotificationType;
  createdAt: Date;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  readAt: Date | null;
}

export interface CopyRelationship {
  id: string;
  followerId: string;
  traderId: string;
  createdAt: Date;
  updatedAt: Date;
  allocatedAmount: number;
  maxLossPercent: number;
  copyOpenPositions: boolean;
  status: CopyStatus;
  pnl: number;
  stoppedAt: Date | null;
  excludeAssets: string[];
  maxSizePerTrade: number | null;
}

// ============================================
// API Request/Response Types
// ============================================

// Feed
export type FeedType = 'trending' | 'following' | 'foryou';

export interface FeedQuery {
  type?: FeedType;
  cursor?: string;
  limit?: number;
  ticker?: string;
}

export interface FeedResponse {
  ideas: TradeIdeaWithMetrics[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Profile
export interface CreateProfileBody {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
}

export interface UpdateProfileBody extends Partial<CreateProfileBody> {
  isVerified?: boolean;
  verificationTier?: VerificationTier;
}

// Trade Ideas
export interface CreateIdeaBody {
  title?: string;
  content: string;
  tickers: string[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number;
  timeframe?: Timeframe;
  direction?: TradeDirection;
  thesis?: string;
  visibility?: Visibility;
  charts?: ChartAttachment[];
}

export interface UpdateIdeaBody extends Partial<CreateIdeaBody> {
  status?: IdeaStatus;
  closeReason?: string;
}

// Comments
export interface CreateCommentBody {
  content: string;
  parentId?: string;
}

// Notifications
export interface NotificationsQuery {
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: SocialNotification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
}

// Follow
export interface FollowResponse {
  isFollowing: boolean;
  followersCount: number;
}

// ============================================
// React Query Keys
// ============================================

export const socialKeys = {
  all: ['social'] as const,
  feed: (type: FeedType, ticker?: string) => [...socialKeys.all, 'feed', type, ticker] as const,
  idea: (id: string) => [...socialKeys.all, 'idea', id] as const,
  ideas: (userId: string) => [...socialKeys.all, 'ideas', userId] as const,
  profile: (userId: string) => [...socialKeys.all, 'profile', userId] as const,
  myProfile: () => [...socialKeys.all, 'myProfile'] as const,
  followers: (userId: string) => [...socialKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...socialKeys.all, 'following', userId] as const,
  notifications: () => [...socialKeys.all, 'notifications'] as const,
  bookmarks: () => [...socialKeys.all, 'bookmarks'] as const,
};