"use client";

/**
 * @ai-context Client component that renders long text truncated to N lines
 * with a "Read more / Show less" toggle button.
 * @ai-related components/finance section in ticker page
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  /** The full text content to display */
  text: string;
  /** Number of lines to clamp to when collapsed (default: 3) */
  lines?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Renders text clamped to `lines` lines with a toggle to expand/collapse.
 * Uses CSS `line-clamp` for truncation — no JS measurement needed.
 *
 * @param text    Full text to render
 * @param lines   Max visible lines when collapsed (default 3)
 * @param className  Extra Tailwind classes
 */
export function ExpandableText({ text, lines = 3, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  // Map line count to Tailwind line-clamp class
  // @ai-warning Tailwind needs the full class string at build-time; using a map avoids purging.
  const clampClassMap: Record<number, string> = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
    6: "line-clamp-6",
  };

  const clampClass = clampClassMap[lines] ?? "line-clamp-3";

  return (
    <div className={cn("space-y-1", className)}>
      <p
        className={cn(
          "text-sm text-muted-foreground leading-relaxed",
          !expanded && clampClass
        )}
      >
        {text}
      </p>
      {text.length > 0 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          type="button"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
