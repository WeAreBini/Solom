/**
 * Social Trading Types
 * 
 * Type definitions for the Social Trading feature (Issue #44)
 */

// ============================================
// User Profile Types
// ============================================

export type VerificationTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  isVerified: boolean;
  verificationTier: VerificationTier;
  followersCount: number;
  followingCount: number;
  ideasCount: number;
  winRate: number | null;
  avgReturn: number | null;
  brokerageConnected: boolean;
  brokerageName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileStats {
  followersCount: number;
  followingCount: number;
  ideasCount: number;
  winRate: number | null;
  avgReturn: number | null;
}

// ============================================
// Follow Types
// ============================================

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowWithProfile extends Follow {
  follower?: UserProfile;
  following?: UserProfile;
}

// ============================================
// Trade Idea Types
// ============================================

export type Timeframe = 'INTRADAY' | 'SWING' | 'POSITION';
export type TradeDirection = 'LONG' | 'SHORT' | 'NEUTRAL';
export type IdeaStatus = 'ACTIVE' | 'CLOSED' | 'INVALIDATED';
export type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export interface ChartAttachment {
  url: string;
  caption?: string;
  type: 'image' | 'video';
}

export interface TradeIdea {
  id: string;
  authorId: string;
  content: string;
  title: string | null;
  tickers: string[];
  entryPrice: number | null;
  targetPrice: number | null;
  stopLoss: number | null;
  positionSize: number | null;
  timeframe: Timeframe | null;
  direction: TradeDirection | null;
  status: IdeaStatus;
  closedAt: Date | null;
  closeReason: string | null;
  charts: ChartAttachment[] | null;
  thesis: string | null;
  visibility: Visibility;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeIdeaWithAuthor extends TradeIdea {
  author: UserProfile;
}

export interface TradeIdeaWithMetrics extends TradeIdeaWithAuthor {
  isLiked: boolean;
  isBookmarked: boolean;
}

// ============================================
// Interaction Types
// ============================================

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
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithAuthor extends Comment {
  author: UserProfile;
  replies?: CommentWithAuthor[];
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'NEW_IDEA'
  | 'NEW_FOLLOWER'
  | 'COMMENT_REPLY'
  | 'IDEA_CLOSED'
  | 'PERFORMANCE_MILESTONE'
  | 'PRICE_ALERT'
  | 'VERIFICATION_APPROVED'
  | 'COPY_STARTED'
  | 'COPY_STOPPED';

export interface NotificationData {
  ideaId?: string;
  followerId?: string;
  commentId?: string;
  milestone?: string;
  price?: number;
  symbol?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: NotificationData | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// ============================================
// Feed Types
// ============================================

export type FeedType = 'following' | 'foryou' | 'trending';

export interface FeedQuery {
  type: FeedType;
  cursor?: string;
  limit?: number;
  ticker?: string;
  authorId?: string;
}

export interface FeedResponse {
  ideas: TradeIdeaWithMetrics[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateIdeaRequest {
  content: string;
  title?: string;
  tickers: string[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number;
  timeframe?: Timeframe;
  direction?: TradeDirection;
  charts?: ChartAttachment[];
  thesis?: string;
  visibility?: Visibility;
}

export interface UpdateIdeaRequest {
  content?: string;
  title?: string;
  tickers?: string[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number;
  timeframe?: Timeframe;
  direction?: TradeDirection;
  thesis?: string;
  visibility?: Visibility;
  status?: IdeaStatus;
  closeReason?: string;
}

export interface CreateCommentRequest {
  ideaId: string;
  content: string;
  parentId?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
}

// ============================================
// Copy Trading Types (Phase 3)
// ============================================

export type CopyStatus = 'ACTIVE' | 'PAUSED' | 'STOPPED';

export interface CopyRelationship {
  id: string;
  followerId: string;
  traderId: string;
  allocatedAmount: number;
  maxLossPercent: number;
  copyOpenPositions: boolean;
  status: CopyStatus;
  pnl: number;
  startedAt: Date;
  stoppedAt: Date | null;
}

export interface StartCopyRequest {
  traderId: string;
  allocatedAmount: number;
  maxLossPercent?: number;
  copyOpenPositions?: boolean;
}

// ============================================
// Helper Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}