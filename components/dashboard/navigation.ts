/**
 * @ai-context Shared navigation model for the current dashboard surfaces.
 * Keeps header, sidebar, and command-palette links aligned to the live route tree.
 * @ai-related components/dashboard/Sidebar.tsx, components/dashboard/CommandPalette.tsx, app/dashboard/page.tsx
 */
import type { LucideIcon } from "lucide-react";
import { BarChart3, Landmark, TrendingUp, Users } from "lucide-react";

export interface DashboardNavItem {
  title: string;
  shortTitle: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const dashboardNavItems: readonly DashboardNavItem[] = [
  {
    title: "Markets",
    shortTitle: "Markets",
    href: "/dashboard",
    icon: TrendingUp,
    description: "Overview, indices, movers, and live market status.",
  },
  {
    title: "Stocks",
    shortTitle: "Stocks",
    href: "/dashboard/stocks",
    icon: BarChart3,
    description: "Expanded stock analytics, alerts, and watchlist tools.",
  },
  {
    title: "Finance",
    shortTitle: "Finance",
    href: "/dashboard/finance",
    icon: Landmark,
    description: "Broader financial intelligence and macro context.",
  },
  {
    title: "Social",
    shortTitle: "Social",
    href: "/dashboard/social",
    icon: Users,
    description: "Community ideas, traders, and collaborative market signals.",
  },
] as const;

/**
 * @ai-context Normalizes current-route checks for dashboard navigation.
 * @param pathname Current Next.js pathname without query string.
 * @param href Dashboard route to compare.
 * @returns True when the navigation item should render as active.
 */
export function isDashboardNavItemActive(pathname: string, href: string): boolean {
  return pathname === href;
}