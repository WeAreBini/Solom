"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { gridSpacing, breakpoints } from "@/lib/design-tokens";

// ============================================
// Dashboard Grid Layout Components
// ============================================

/**
 * Dashboard Grid Container
 * Provides a responsive grid layout for dashboard sections
 */
export interface DashboardGridProps {
  /** Number of columns at different breakpoints */
  cols?: {
    default?: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4 | 6;
    lg?: 1 | 2 | 3 | 4 | 6;
    xl?: 1 | 2 | 3 | 4 | 6;
  };
  /** Gap between items */
  gap?: "none" | "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
  /** Children */
  children: React.ReactNode;
}

export function DashboardGrid({
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  className,
  children,
}: DashboardGridProps) {
  const gapClass = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const colClass = cn(
    "grid",
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return (
    <div className={cn(colClass, gapClass, className)}>
      {children}
    </div>
  );
}

/**
 * Dashboard Section
 * A logical grouping of related dashboard components
 */
export interface DashboardSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Icon for the section header */
  icon?: React.ReactNode;
  /** Action buttons in the header */
  actions?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Enable collapsible behavior */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Additional class name */
  className?: string;
}

export function DashboardSection({
  title,
  description,
  icon,
  actions,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: DashboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h2 className={cn(
                  "text-lg font-semibold",
                  collapsible && "cursor-pointer select-none"
                )}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div className="transition-all duration-200">
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Dashboard Sidebar Layout
 * Main content area with a collapsible sidebar
 */
export interface DashboardSidebarLayoutProps {
  /** Main content */
  children: React.ReactNode;
  /** Sidebar content - can be ReactNode or render prop function */
  sidebar: React.ReactNode | ((props: { isSidebarOpen: boolean; setIsSidebarOpen: (open: boolean) => void }) => React.ReactNode);
  /** Sidebar width */
  sidebarWidth?: "sm" | "md" | "lg";
  /** Enable collapsible sidebar */
  collapsible?: boolean;
  /** Mobile drawer behavior */
  mobileDrawer?: boolean;
  /** Additional class name */
  className?: string;
}

export function DashboardSidebarLayout({
  children,
  sidebar,
  sidebarWidth = "md",
  collapsible = true,
  // mobileDrawer is reserved for future mobile drawer implementation
  className,
}: DashboardSidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarWidthClass = {
    sm: "lg:w-64",
    md: "lg:w-80",
    lg: "lg:w-96",
  }[sidebarWidth];

  return (
    <div className={cn("flex flex-col lg:flex-row gap-6", className)}>
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* Sidebar */}
      <aside
        className={cn(
          "transition-all duration-300",
          sidebarWidthClass,
          collapsible && !isSidebarOpen && "lg:w-0 lg:overflow-hidden"
        )}
      >
        <div className="sticky top-20">
          {typeof sidebar === "function" ? sidebar({ isSidebarOpen, setIsSidebarOpen }) : sidebar}
        </div>
      </aside>
    </div>
  );
}

/**
 * Dashboard Panel
 * A card-like container for dashboard content
 */
export interface DashboardPanelProps {
  /** Panel title */
  title?: string;
  /** Panel badge */
  badge?: React.ReactNode;
  /** Panel actions */
  actions?: React.ReactNode;
  /** Panel content */
  children: React.ReactNode;
  /** Enable hover interaction */
  interactive?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Empty state content */
  emptyContent?: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Padding variant */
  padding?: "none" | "sm" | "md" | "lg";
  /** Click handler */
  onClick?: () => void;
}

export function DashboardPanel({
  title,
  badge,
  actions,
  children,
  interactive = false,
  isLoading = false,
  error,
  emptyContent,
  className,
  padding = "md",
  onClick,
}: DashboardPanelProps) {
  const paddingClass = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }[padding];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "transition-all duration-200",
        interactive && "hover:shadow-md hover:border-primary/30 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Panel Header */}
      {(title || actions || badge) && (
        <div className={cn("flex items-center justify-between border-b", paddingClass)}>
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="font-semibold">{title}</h3>
            )}
            {badge}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Panel Content */}
      <div className={cn((title || actions || badge) ? "" : paddingClass)}>
        {isLoading ? (
          <div className="animate-pulse space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard Split Panel
 * Two-column panel layout for comparison or details
 */
export interface DashboardSplitPanelProps {
  /** Left panel content */
  left: React.ReactNode;
  /** Right panel content */
  right: React.ReactNode;
  /** Split ratio */
  ratio?: "50-50" | "60-40" | "70-30" | "40-60" | "30-70";
  /** Gap between panels */
  gap?: "none" | "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
}

export function DashboardSplitPanel({
  left,
  right,
  ratio = "50-50",
  gap = "md",
  className,
}: DashboardSplitPanelProps) {
  const gapClass = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const ratioClass = {
    "50-50": "grid-cols-2",
    "60-40": "grid-cols-[3fr_2fr]",
    "70-30": "grid-cols-[7fr_3fr]",
    "40-60": "grid-cols-[2fr_3fr]",
    "30-70": "grid-cols-[3fr_7fr]",
  }[ratio];

  return (
    <div className={cn("grid", ratioClass, gapClass, className)}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/**
 * Quick Stats Row
 * Horizontal row of mini stats for dashboards
 */
export interface QuickStatsRowProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
  }>;
  /** Show dividers between stats */
  dividers?: boolean;
  /** Additional class name */
  className?: string;
}

export function QuickStatsRow({
  stats,
  dividers = true,
  className,
}: QuickStatsRowProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-2">
            {stat.icon && (
              <span className="text-muted-foreground">{stat.icon}</span>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{stat.value}</span>
                {stat.change !== undefined && (
                  <span
                    className={cn(
                      "text-xs",
                      stat.change >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change}%
                  </span>
                )}
              </div>
            </div>
          </div>
          {dividers && index < stats.length - 1 && (
            <div className="h-8 w-px bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Dashboard Status Bar
 * Shows market status and last update time
 */
export interface DashboardStatusBarProps {
  /** Market status */
  status: "open" | "closed" | "pre-market" | "after-hours";
  /** Last update timestamp */
  lastUpdated?: Date;
  /** On refresh callback */
  onRefresh?: () => void;
  /** Is refreshing */
  isLoading?: boolean;
  /** Additional class name */
  className?: string;
}

export function DashboardStatusBar({
  status,
  lastUpdated,
  onRefresh,
  isLoading = false,
  className,
}: DashboardStatusBarProps) {
  const statusConfig = {
    open: { label: "Market Open", color: "emerald" },
    closed: { label: "Market Closed", color: "red" },
    "pre-market": { label: "Pre-Market", color: "amber" },
    "after-hours": { label: "After Hours", color: "amber" },
  };

  const { label, color } = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            status === "open" && "animate-pulse bg-emerald-500",
            status === "closed" && "bg-red-500",
            (status === "pre-market" || status === "after-hours") && "bg-amber-500"
          )}
        />
        <span className="text-sm font-medium">{label}</span>
        <span
          className={cn(
            "ml-1 text-xs px-2 py-0.5 rounded",
            status === "open" && "bg-emerald-100 text-emerald-700",
            status === "closed" && "bg-red-100 text-red-700",
            (status === "pre-market" || status === "after-hours") && "bg-amber-100 text-amber-700"
          )}
        >
          {status === "open" ? "Live" : status === "closed" ? "Closed" : "Limited"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {lastUpdated && (
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "rounded p-1 hover:bg-muted transition-colors",
              isLoading && "animate-spin cursor-not-allowed opacity-50"
            )}
            aria-label="Refresh data"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardGrid;