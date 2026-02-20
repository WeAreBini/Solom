/**
 * @ai-context Reusable news article card component.
 * Used on Dashboard, Ticker detail, and Market pages.
 * @ai-related app/actions/fmp.ts
 */
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  title: string;
  source: string;
  publishedDate: string;
  url: string;
  image?: string;
  symbol?: string;
}

export function NewsCard({
  title,
  source,
  publishedDate,
  url,
  image,
  symbol,
}: NewsCardProps) {
  const timeAgo = getTimeAgo(publishedDate);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hover press-scale"
    >
      {image && (
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {symbol && (
            <span className="font-mono font-semibold text-foreground">
              {symbol}
            </span>
          )}
          <span>{source}</span>
          <span>·</span>
          <span>{timeAgo}</span>
          <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
