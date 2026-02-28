# Social Trading Feature Specification

**Issue:** [#13 - Social Trading (inspired by TradingView)](https://github.com/WeAreBini/Solom/issues/13)
**Status:** Draft
**Author:** Solom Developer Agent
**Date:** 2026-02-28
**Priority:** High

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature Overview](#feature-overview)
3. [Core Features](#core-features)
4. [Technical Architecture](#technical-architecture)
5. [Data Models](#data-models)
6. [API Specifications](#api-specifications)
7. [UI/UX Components](#uiux-components)
8. [Implementation Phases](#implementation-phases)
9. [Security & Compliance](#security--compliance)
10. [Performance Considerations](#performance-considerations)
11. [Metrics & Analytics](#metrics--analytics)
12. [References](#references)

---

## Executive Summary

Social Trading transforms Solom from a solitary financial platform into a collaborative community where traders share insights, follow strategies, and learn from each other. Inspired by TradingView's social features and eToro's copy trading, this feature enables users to:

- **Share trade ideas** with annotated charts and analysis
- **Follow top performers** and receive notifications on their activities
- **Copy trade strategies** (future phase) with configurable risk parameters
- **Engage in discussions** around symbols, strategies, and market events
- **Build reputation** through verified performance metrics

This specification outlines a phased implementation approach, starting with core social features and progressively adding advanced functionality like copy trading.

---

## Feature Overview

### What is Social Trading?

Social trading combines financial markets with social networking, allowing users to:
- Publish and consume actionable trade ideas
- Interact with other traders through comments, reactions, and messages
- Track and compare performance transparently
- Learn from experienced traders through observation and discussion

### Why Social Trading for Solom?

| Benefit | Impact |
|---------|--------|
| **User Retention** | Social features increase daily active usage by 40-60% (industry data) |
| **Differentiation** | Sets Solom apart from pure analytics platforms |
| **Network Effects** | More users = more content = more value for everyone |
| **Monetization** | Premium features (verified profiles, advanced analytics, private groups) |

### Target Users

1. **New Traders** - Learn by observing experienced traders
2. **Retail Investors** - Get curated, performance-backed insights
3. **Trading Influencers** - Build audience and track record
4. **Quant Hobbyists** - Share strategies and get feedback

---

## Core Features

### Phase 1: Foundation Features (MVP)

#### 1.1 Social Feed & Trade Ideas

**Description:** A dynamic feed where users can publish and consume trade-related content.

**Features:**
- Rich text posts with embedded ticker symbols (auto-linked to charts)
- Annotated chart uploads (supports PNG, JPG, GIF)
- Screen recordings/video uploads (future: integration with Loom-style embeds)
- Voice notes for quick thesis sharing
- Entry/exit levels, position sizing, timeframe tags
- Post visibility controls (public, followers-only, private)

**User Actions:**
- Create, edit, delete posts
- Like, react with emojis (bullish/bearish/watching)
- Comment with thread support
- Share posts externally (Twitter, LinkedIn)
- Bookmark for later reference
- Report inappropriate content

**Data Model (Draft):**
```typescript
interface TradeIdea {
  id: string;
  authorId: string;
  content: string;
  tickers: TickerMention[];
  charts: ChartAttachment[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number;
  timeframe: 'intraday' | 'swing' | 'position';
  thesis: string;
  status: 'active' | 'closed' | 'invalidated';
  visibility: 'public' | 'followers' | 'private';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
}
```

#### 1.2 User Profiles & Reputation

**Description:** Verified profiles with transparent performance metrics.

**Features:**
- Public profile pages with bio, avatar, join date
- Verified performance badges (linked to brokerage or manual logging)
- Key metrics display:
  - Win rate (30/60/90 day)
  - Average return per trade
  - Maximum drawdown
  - Risk-adjusted returns (Sharpe ratio)
  - Total followers
- Badges for achievements (consistent performer, top analyst, verified)
- Activity history (ideas posted, accuracy rate)

**Verification Tiers:**
| Tier | Requirements | Benefits |
|------|-------------|----------|
| **Bronze** | Basic profile | Can post and comment |
| **Silver** | 10+ ideas, 50% accuracy | Enhanced visibility |
| **Gold** | Brokerage connection | Verified badge, analytics dashboard |
| **Platinum** | Top 5% performance | Featured placement, monetization |

#### 1.3 Following & Notifications

**Description:** Follow traders and receive timely updates.

**Features:**
- Follow/unfollow users
- Following feed (posts from followed users)
- Personalized "For You" feed (algorithmic ranking)
- Notification preferences:
  - New ideas from followed traders
  - Comments on your posts
  - Price alerts on watched symbols
  - Performance milestone alerts
- Push notifications (mobile)
- Email digest (daily/weekly)

**Notification Types:**
```typescript
type NotificationType =
  | 'new_idea'
  | 'new_follower'
  | 'comment_reply'
  | 'idea_closed'
  | 'performance_milestone'
  | 'price_alert'
  | 'verification_approved';
```

#### 1.4 Symbol-Specific Discussions (Minds)

**Description:** Dedicated discussion spaces for each symbol (inspired by TradingView's Minds).

**Features:**
- Symbol page with integrated discussion tab
- Real-time price display with mini-chart
- Recent ideas and discussions for symbol
- Mentions feed (all posts mentioning the symbol)
- Statistics (sentiment breakdown, top contributors)

### Phase 2: Engagement Features

#### 2.1 Community Scripts & Strategies

**Description:** Share and discover trading strategies (Pine Script-inspired).

**Features:**
- Strategy sharing with code snippets
- Backtest results attachment
- Community ratings and reviews
- "Use this strategy" button (auto-applies to chart)
- Version history and updates

#### 2.2 Shared Watchlists & Signals

**Description:** Collaborative watchlists and signal sharing.

**Features:**
- Create and share custom watchlists
- Follow others' watchlists
- Set price alerts with triggers
- Signal publishing ("Long $NVDA if breaks $450")
- Signal performance tracking

#### 2.3 Private Groups & Channels

**Description:** Topic-specific community spaces.

**Features:**
- Public channels (open to all)
- Private groups (invite-only or approval-based)
- Premium channels (subscription-based)
- Moderation tools for admins
- Group analytics

### Phase 3: Advanced Features

#### 3.1 Copy Trading (eToro-inspired)

**Description:** Automatically replicate trades from chosen traders.

**Features:**
- Copy settings:
  - Investment amount
  - Stop-loss threshold (auto-stop copying at X% loss)
  - Copy open positions (yes/no)
  - Maximum position size
- Selective copying (choose specific assets/types)
- Copy history and performance tracking
- Risk disclosure and warnings
- One-click stop copying

**Data Model:**
```typescript
interface CopyRelationship {
  id: string;
  followerId: string;
  traderId: string;
  allocatedAmount: number;
  maxLossPercent: number;
  copyOpenPositions: boolean;
  status: 'active' | 'paused' | 'stopped';
  pnl: number;
  startedAt: Date;
  settings: {
    excludeAssets?: string[];
    maxSizePerTrade?: number;
  };
}
```

#### 3.2 Leaderboards & Rankings

**Description:** Discover top performers.

**Features:**
- Global leaderboard (all-time, monthly, weekly)
- Category-specific (stocks, crypto, forex, options)
- Risk-adjusted rankings (Sharpe, Sortino)
- Sector specialists
- New trader spotlight
- Anti-gaming measures (excluding high-risk strategies from "safe" lists)

#### 3.3 Monetization for Creators

**Description:** Enable top traders to monetize their expertise.

**Features:**
- Subscription tiers (free, premium, VIP)
- Exclusive content for subscribers
- Private signals for paid members
- Revenue sharing model
- Analytics for creators

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Feed UI       │   Profile UI    │   Notifications UI          │
└────────┬────────┴────────┬────────┴──────────┬─────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (tRPC/Next.js Routes)              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Posts API      │  Users API      │  Notifications API         │
│  Comments API   │  Following API  │  Signals API                │
└────────┬────────┴────────┬────────┴──────────┬─────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ Feed Service    │ Reputation Svc  │ Notification Service        │
│ Moderation Svc  │ Analytics Svc    │ Real-time Events            │
└────────┬────────┴────────┬────────┴──────────┬─────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  PostgreSQL     │  Redis          │  TimescaleDB               │
│  (Users, Posts) │  (Cache, Queue) │  (Time-series analytics)   │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ Market Data API │ Push Notifs     │ Email Service               │
│ (Polygon, etc.) │ (FCM/APNs)      │ (Resend/SendGrid)           │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Technology Stack Recommendations

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS | Existing stack, server components |
| **API** | tRPC + Next.js API routes | Type-safe, colocation |
| **Database** | PostgreSQL (Prisma ORM) | Existing stack, relational data |
| **Cache** | Redis | Feed caching, rate limiting |
| **Real-time** | Pusher/Ably or WebSocket | Live updates, notifications |
| **Search** | Meilisearch or PostgreSQL FTS | Post/search discovery |
| **Media** | S3/Cloudflare R2 | Chart images, videos |
| **Queue** | BullMQ (Redis-based) | Background jobs, notifications |
| **Monitoring** | Sentry + OpenTelemetry | Error tracking, performance |

---

## Data Models

### Prisma Schema (Draft)

```prisma
// Core User Extension
model UserProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Profile Data
  displayName String?
  bio         String?  @db.Text
  avatarUrl   String?
  website     String?
  
  // Verification
  isVerified  Boolean  @default(false)
  verificationTier VerificationTier @default(BRONZE)
  
  // Statistics (computed/cached)
  followersCount   Int @default(0)
  followingCount   Int @default(0)
  ideasCount       Int @default(0)
  winRate          Float?
  avgReturn       Float?
  
  // Brokerage Connection (for copy trading)
  brokerageConnected Boolean @default(false)
  brokerageName     String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

// Following Relationship
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  follower    UserProfile @relation("Following", fields: [followerId], references: [userId])
  following   UserProfile @relation("Followers", fields: [followingId], references: [userId])
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

// Trade Ideas/Posts
model TradeIdea {
  id          String   @id @default(cuid())
  authorId    String
  author      UserProfile @relation(fields: [authorId], references: [userId])
  
  content     String   @db.Text
  title       String?
  
  // Trade Details
  tickers     String[] // Array of symbols
  entryPrice  Float?
  targetPrice Float?
  stopLoss    Float?
  positionSize Float?
  timeframe   Timeframe?
  direction   TradeDirection?
  
  // Status
  status      IdeaStatus @default(ACTIVE)
  closedAt    DateTime?
  closeReason String?
  
  // Content
  charts     Json? // Array of chart attachments
  thesis     String? @db.Text
  
  // Visibility
  visibility  Visibility @default(PUBLIC)
  
  // Metrics (caching)
  viewCount   Int      @default(0)
  likeCount   Int      @default(0)
  commentCount Int     @default(0)
  bookmarkCount Int    @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
  @@index([status, createdAt])
  @@index([tickers])
}

// Interactions
model Like {
  id        String   @id @default(cuid())
  userId    String
  ideaId    String
  createdAt DateTime @default(now())
  
  user      UserProfile @relation(fields: [userId], references: [userId])
  idea      TradeIdea @relation(fields: [ideaId], references: [id])
  
  @@unique([userId, ideaId])
}

model Comment {
  id        String   @id @default(cuid())
  ideaId    String
  authorId  String
  parentId  String? // For nested comments
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  idea      TradeIdea @relation(fields: [ideaId], references: [id])
  author    UserProfile @relation(fields: [authorId], references: [userId])
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}

// Notifications
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  body        String?
  data        Json? // Additional context
  
  read        Boolean @default(false)
  readAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([userId, read])
  @@index([userId, createdAt])
}

// Copy Trading (Phase 3)
model CopyRelationship {
  id                  String   @id @default(cuid())
  followerId          String
  traderId            String
  allocatedAmount     Float
  maxLossPercent      Float   @default(20.0)
  copyOpenPositions   Boolean @default(false)
  status              CopyStatus @default(ACTIVE)
  
  pnl                 Float   @default(0)
  startedAt           DateTime @default(now())
  stoppedAt           DateTime?
  
  follower            UserProfile @relation("CopyFollower", fields: [followerId], references: [userId])
  trader              UserProfile @relation("CopyTrader", fields: [traderId], references: [userId])
  
  @@index([followerId])
  @@index([traderId])
}

// Enums
enum VerificationTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum Timeframe {
  INTRADAY
  SWING
  POSITION
}

enum TradeDirection {
  LONG
  SHORT
  NEUTRAL
}

enum IdeaStatus {
  ACTIVE
  CLOSED
  INVALIDATED
}

enum Visibility {
  PUBLIC
  FOLLOWERS
  PRIVATE
}

enum NotificationType {
  NEW_IDEA
  NEW_FOLLOWER
  COMMENT_REPLY
  IDEA_CLOSED
  PERFORMANCE_MILESTONE
  PRICE_ALERT
  VERIFICATION_APPROVED
  COPY_STARTED
  COPY_STOPPED
}

enum CopyStatus {
  ACTIVE
  PAUSED
  STOPPED
}
```

---

## API Specifications

### Core Endpoints

#### Feed Endpoints

```typescript
// GET /api/feed
// Get user's feed (following + algorithmic)
interface FeedQuery {
  type: 'following' | 'foryou' | 'trending';
  cursor?: string;
  limit?: number;
}

// POST /api/ideas
// Create a new trade idea
interface CreateIdeaBody {
  content: string;
  tickers: string[];
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe?: Timeframe;
  direction?: TradeDirection;
  charts?: File[];
  thesis?: string;
  visibility?: Visibility;
}

// POST /api/ideas/:id/like
// Like/unlike an idea

// POST /api/ideas/:id/comments
// Add comment to an idea

// POST /api/ideas/:id/bookmark
// Bookmark an idea
```

#### User Endpoints

```typescript
// GET /api/users/:id
// Get user profile
interface UserProfileResponse {
  id: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  verificationTier: VerificationTier;
  statistics: {
    followersCount: number;
    ideasCount: number;
    winRate: number;
    avgReturn: number;
  };
}

// POST /api/users/:id/follow
// Follow/unfollow a user

// GET /api/users/:id/ideas
// Get user's trade ideas

// GET /api/users/:id/followers
// Get user's followers

// GET /api/users/:id/following
// Get who the user follows
```

#### Notification Endpoints

```typescript
// GET /api/notifications
// Get user's notifications
interface NotificationsQuery {
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
}

// POST /api/notifications/:id/read
// Mark notification as read

// POST /api/notifications/read-all
// Mark all as read

// WebSocket: /ws/notifications
// Real-time notification stream
```

#### Copy Trading Endpoints (Phase 3)

```typescript
// POST /api/copy/start
// Start copying a trader
interface StartCopyBody {
  traderId: string;
  allocatedAmount: number;
  maxLossPercent?: number;
  copyOpenPositions?: boolean;
}

// POST /api/copy/:id/stop
// Stop copying

// POST /api/copy/:id/pause
// Pause copying

// GET /api/copy/active
// Get active copy relationships

// GET /api/copy/performance
// Get copy trading performance
```

---

## UI/UX Components

### Key Components

```tsx
// 1. Feed Component
// components/feed/Feed.tsx
// - Virtualized list for performance
// - Infinite scroll
// - Pull-to-refresh (mobile)

// 2. Trade Idea Card
// components/ideas/IdeaCard.tsx
// - Rich content rendering
// - Inline chart preview
// - Like/comment/bookmark actions
// - Share functionality

// 3. Create Idea Modal
// components/ideas/CreateIdeaModal.tsx
// - Rich text editor
// - Chart upload (drag & drop)
// - Ticker input with autocomplete
// - Trade parameters form

// 4. User Profile Card
// components/users/ProfileCard.tsx
// - Avatar, name, bio
// - Verification badge
// - Statistics display
// - Follow button

// 5. Notification Center
// components/notifications/NotificationCenter.tsx
// - Real-time badge count
// - Notification list with grouping
// - Mark as read functionality

// 6. Symbol Discussion
// components/symbols/SymbolDiscussion.tsx
// - Price display with mini-chart
// - Ideas and posts about symbol
// - Mentions timeline
```

### Design Principles

1. **Performance First** - Virtualized lists, optimistic updates, skeleton loading
2. **Mobile-First** - Responsive design, touch-friendly interactions
3. **Dark Mode** - Full dark mode support (financial apps standard)
4. **Accessibility** - WCAG 2.1 AA compliance, screen reader support
5. **Real-time Feel** - Live updates, connection status indicators

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

| Week | Tasks |
|------|-------|
| 1 | Database schema, user profile extension, base models |
| 2 | Trade idea CRUD, feed API endpoints |
| 3 | Likes, comments, follows functionality |
| 4 | Basic UI components, feed rendering |

**Deliverables:**
- User profiles with basic stats
- Trade idea publishing (text + images)
- Feed (following + public)
- Like, comment, follow functionality

### Phase 2: Engagement (Weeks 5-8)

| Week | Tasks |
|------|-------|
| 5 | Notification system (in-app + email) |
| 6 | Symbol pages with discussions |
| 7 | Search, discovery, trending |
| 8 | Moderation tools, reporting |

**Deliverables:**
- Real-time notifications
- Symbol-specific discussions
- Content discovery
- Moderation dashboard

### Phase 3: Copy Trading (Weeks 9-14)

| Week | Tasks |
|------|-------|
| 9-10 | Brokerage integration (Plaid/official APIs) |
| 11-12 | Copy trading core logic |
| 13 | Leaderboards, rankings |
| 14 | Creator monetization |

**Deliverables:**
- Verified performance via brokerage
- Copy trading with risk controls
- Leaderboards
- Premium features

### Phase 4: Polish & Scale (Weeks 15-16)

| Week | Tasks |
|------|-------|
| 15 | Performance optimization, caching |
| 16 | Mobile app enhancements, PWA |

---

## Security & Compliance

### Authentication & Authorization

- **OAuth 2.0** for brokerage connections
- **MFA** required for copy trading
- **Rate limiting** on all endpoints (100 req/min for authenticated)
- **Content Security Policy** for rich media

### Content Moderation

```typescript
// Automated filters
const BLOCKED_PATTERNS = [
  /guaranteed.*returns/i,
  /dm.*for.*signals/i,
  /100x.*gem/i,
  /whatsapp.*group/i,
];

// Moderation queue triggers
const MODERATION_TRIGGERS = {
  newAccount: true, // New accounts (< 7 days)
  highReach: true,  // Posts reaching > 100 users
  reported: true,   // Reported content
  externalLinks: true, // Links to external services
};
```

### Financial Disclaimers

- Clear warnings on all trade ideas
- Risk disclosure banners
- Performance disclaimer ("Past performance does not guarantee...")
- No financial advice notice

### Data Protection

- **GDPR compliance** (data export, deletion)
- **CCPA compliance** (California residents)
- **Encryption** for PII at rest and in transit
- **Audit logging** for all financial data access

### Anti-Fraud Measures

- **Sybil detection** (multiple accounts from same source)
- **Pump-and-dump monitoring** (coordinated activity detection)
- **Performance verification** (detect fake P&L screenshots)
- **Rate limiting** on follows, posts, comments

---

## Performance Considerations

### Feed Optimization

```typescript
// Use Redis caching for feed pre-computation
const FEED_CACHE_STRATEGY = {
  timeline: {
    ttl: 60, // seconds
    preCompute: true, // Compute top N posts for active users
    pageSize: 20,
  },
  discovery: {
    ttl: 300,
    preCompute: false,
    pageSize: 20,
  },
};

// Denormalize counts for performance
// Store likeCount, commentCount on TradeIdea
// Update via background jobs
```

### Database Indexing

```sql
-- Critical indexes for feed queries
CREATE INDEX idx_ideas_status_created ON trade_ideas(status, created_at DESC);
CREATE INDEX idx_ideas_author_status ON trade_ideas(author_id, status);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- TimescaleDB for analytics
CREATE hypertable IF NOT EXISTS idea_metrics (
  time_column => 'recorded_at'
);
```

### Real-time Architecture

```typescript
// WebSocket connection for live updates
// Use Pusher or Socket.io
// Channels:
// - private-user-{id}: notifications
// - symbol-{ticker}: symbol updates
// - feed-timeline: new ideas from followed

// Fallback to long-polling for mobile
// Throttle high-frequency updates
```

---

## Metrics & Analytics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Users (DAU)** | Track growth | Unique users with activity |
| **Ideas Posted/Day** | Track volume | Count of new ideas |
| **Engagement Rate** | > 15% | Likes + comments / ideas |
| **Follow Rate** | > 10% | Users with 5+ follows |
| **7-Day Retention** | > 40% | Users returning within 7 days |
| **Time Spent/Session** | > 5 min | Average session duration |

### Analytics Events

```typescript
// Track these events for analysis
type AnalyticsEvent =
  | { type: 'idea_created'; payload: { tickers: string[], hasChart: boolean } }
  | { type: 'idea_viewed'; payload: { ideaId: string } }
  | { type: 'idea_liked'; payload: { ideaId: string } }
  | { type: 'user_followed'; payload: { userId: string } }
  | { type: 'copy_started'; payload: { traderId: string, amount: number } }
  | { type: 'feed_scrolled'; payload: { depth: number } }
  | { type: 'search_performed'; payload: { query: string, results: number } };
```

---

## References

### Competitor Analysis

| Platform | Key Features | Takeaways |
|----------|-------------|-----------|
| **TradingView** | Ideas, Scripts, Minds, Social feed | Clean UX, chart integration, Pine Script |
| **eToro** | CopyTrader, Popular Investors, Social feed | Brokerage integration, verified performance |
| **ZuluTrade** | Signal providers, copy trading | Leader focus, ranking system |
| **NAGA** | Social feed, copy trading, multi-asset | Gamification elements |

### Technical References

1. [TradingView Social Network Features](https://www.tradingview.com/support/solutions/43000761245-tradingview-social-network/)
2. [eToro Copy Trading Implementation](https://www.etoro.com/copytrader/how-it-works/)
3. [Social Trading Platform Architecture](https://shakuro.com/blog/develop-stock-analytics-platform)
4. [Next.js Real-time Features Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
5. [Prisma Relations Best Practices](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries)

---

## Appendix

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-28 | Phase approach (Foundation → Engagement → Copy) | Reduces risk, validates core features first |
| 2026-02-28 | No copy trading in MVP | Requires brokerage integration, legal review |
| 2026-02-28 | PostgreSQL + Redis | Existing stack, proven for social feeds |
| 2026-02-28 | Prisma ORM | Type safety, existing codebase consistency |

### Open Questions

1. **Brokerage Integration Priority:** Which brokerages to support first? (Alpaca, IBKR,others)
2. **Performance Verification:** Manual logging vs. brokerage connection as MVP?
3. **Monetization:** Subscription model vs. creator revenue share percentage?
4. **Mobile Strategy:** React Native app vs. PWA optimization?
5. **Content Review:** Pre-moderation vs. post-moderation for posts?

---

*Document Version: 1.0*
*Last Updated: 2026-02-28*