/**
 * IdeaCard component for displaying a trade idea
 */

'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { TradeIdeaWithMetrics, Timeframe, TradeDirection, IdeaStatus } from '@/lib/types/social';

// Icons (inline SVG for simplicity)
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartFilledIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const BookmarkFilledIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const VerificationBadge = ({ tier }: { tier: string }) => {
  const colors: Record<string, string> = {
    BRONZE: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    SILVER: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
    GOLD: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    PLATINUM: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  };

  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', colors[tier] || colors.BRONZE)}>
      {tier.charAt(0) + tier.slice(1).toLowerCase()}
    </span>
  );
};

const TimeframeBadge = ({ timeframe }: { timeframe: Timeframe }) => {
  const colors: Record<Timeframe, string> = {
    INTRADAY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    SWING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    POSITION: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <Badge variant="secondary" className={cn('text-xs', colors[timeframe])}>
      {timeframe.charAt(0) + timeframe.slice(1).toLowerCase()}
    </Badge>
  );
};

const DirectionBadge = ({ direction }: { direction: TradeDirection }) => {
  if (direction === 'NEUTRAL') return null;

  const colors: Record<TradeDirection, string> = {
    LONG: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    SHORT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    NEUTRAL: '',
  };

  const icons: Record<TradeDirection, string> = {
    LONG: '↑',
    SHORT: '↓',
    NEUTRAL: '',
  };

  return (
    <Badge variant="secondary" className={cn('text-xs', colors[direction])}>
      {icons[direction]} {direction}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: IdeaStatus }) => {
  const colors: Record<IdeaStatus, string> = {
    ACTIVE: 'bg-green-500',
    CLOSED: 'bg-gray-500',
    INVALIDATED: 'bg-red-500',
  };

  const labels: Record<IdeaStatus, string> = {
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    INVALIDATED: 'Invalidated',
  };

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn('w-2 h-2 rounded-full', colors[status])} />
      {labels[status]}
    </span>
  );
};

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString();
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export interface IdeaCardProps {
  idea: TradeIdeaWithMetrics;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

export function IdeaCard({
  idea,
  onLike,
  onBookmark,
  onComment,
  onShare,
  onClick,
  showActions = true,
  className,
}: IdeaCardProps) {
  const author = idea.author;
  const initials = author.displayName
    ? author.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      {/* Direction indicator strip */}
      {idea.direction && idea.direction !== 'NEUTRAL' && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1',
            idea.direction === 'LONG' ? 'bg-green-500' : 'bg-red-500'
          )}
        />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatarUrl || undefined} alt={author.displayName || 'User'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {author.displayName || 'Anonymous'}
                </span>
                {author.isVerified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {author.verificationTier && (
                  <VerificationBadge tier={author.verificationTier} />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(idea.createdAt)}
              </span>
            </div>
          </div>
          <StatusBadge status={idea.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tickers */}
        <div className="flex flex-wrap gap-2">
          {idea.tickers.map((ticker) => (
            <Badge key={ticker} variant="outline" className="font-mono text-xs">
              ${ticker}
            </Badge>
          ))}
          {idea.timeframe && <TimeframeBadge timeframe={idea.timeframe} />}
          {idea.direction && <DirectionBadge direction={idea.direction} />}
        </div>

        {/* Title and Content */}
        {idea.title && (
          <h3 className="font-semibold text-lg leading-tight">{idea.title}</h3>
        )}
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-6">
          {idea.content}
        </p>

        {/* Trade Details */}
        {(idea.entryPrice || idea.targetPrice || idea.stopLoss) && (
          <div className="flex flex-wrap gap-4 text-sm bg-muted/50 rounded-lg p-3">
            {idea.entryPrice && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Entry</span>
                <span className="font-mono font-medium">{formatCurrency(idea.entryPrice)}</span>
              </div>
            )}
            {idea.targetPrice && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Target</span>
                <span className="font-mono font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(idea.targetPrice)}
                </span>
              </div>
            )}
            {idea.stopLoss && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Stop Loss</span>
                <span className="font-mono font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(idea.stopLoss)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Thesis */}
        {idea.thesis && (
          <div className="text-sm text-muted-foreground border-l-2 border-primary/50 pl-3">
            <span className="font-medium text-foreground">Thesis: </span>
            {idea.thesis}
          </div>
        )}

        {/* Charts */}
        {idea.charts && idea.charts.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {idea.charts.map((chart, index) => (
              <img
                key={index}
                src={chart.url}
                alt={chart.caption || 'Chart'}
                className="rounded-lg object-cover w-full h-32 bg-muted"
              />
            ))}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-2 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 text-muted-foreground hover:text-red-500',
                  idea.isLiked && 'text-red-500 hover:text-red-600'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                {idea.isLiked ? (
                  <HeartFilledIcon className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                <span>{formatNumber(idea.likeCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onComment?.();
                }}
              >
                <ChatIcon className="w-4 h-4" />
                <span>{formatNumber(idea.commentCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.();
                }}
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatNumber(idea.viewCount)} views
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'text-muted-foreground hover:text-primary',
                  idea.isBookmarked && 'text-primary hover:text-primary/80'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark?.();
                }}
              >
                {idea.isBookmarked ? (
                  <BookmarkFilledIcon className="w-4 h-4" />
                ) : (
                  <BookmarkIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export function IdeaCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="h-16 w-full bg-muted rounded-lg" />
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}