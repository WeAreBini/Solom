/**
 * @ai-context Shared navigation model for the Solom market-intelligence shell.
 * Keeps desktop, mobile, overview surfaces, and side panels aligned around the same IA.
 * @ai-related components/layout/Sidebar.tsx, components/layout/TopBar.tsx, components/layout/MobileNav.tsx
 */
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bitcoin,
  BookOpen,
  BriefcaseBusiness,
  CandlestickChart,
  Landmark,
  LayoutDashboard,
  LineChart,
  Newspaper,
  ScanSearch,
  Users,
  Wallet,
} from "lucide-react";

export interface NavigationItem {
  readonly title: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
  readonly matchPrefixes?: readonly string[];
}

export interface NavigationSection extends NavigationItem {
  readonly eyebrow: string;
  readonly surfaceCount: string;
  readonly items: readonly NavigationItem[];
}

export const primarySections = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
    eyebrow: "Command Center",
    surfaceCount: "3 surfaces",
    description: "Unified market, discovery, and dashboard entry points.",
    matchPrefixes: ["/dashboard", "/discover"],
    items: [
      {
        title: "Home",
        href: "/",
        icon: LayoutDashboard,
        description: "Cross-asset market intelligence overview.",
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: ScanSearch,
        description: "Portfolio command center with market context.",
      },
      {
        title: "Discover",
        href: "/discover",
        icon: Newspaper,
        description: "Trending equities, movers, and sector breadth.",
      },
    ],
  },
  {
    title: "Markets",
    href: "/market",
    icon: CandlestickChart,
    eyebrow: "Price Action",
    surfaceCount: "3 surfaces",
    description: "Market movers, rankings, and the earnings calendar.",
    matchPrefixes: ["/ranks", "/earnings"],
    items: [
      {
        title: "Market",
        href: "/market",
        icon: CandlestickChart,
        description: "Gainers, losers, and most active names.",
      },
      {
        title: "Rankings",
        href: "/ranks",
        icon: LineChart,
        description: "Leaderboard view for top movers.",
      },
      {
        title: "Earnings",
        href: "/earnings",
        icon: Activity,
        description: "Upcoming reports and estimate beats or misses.",
      },
    ],
  },
  {
    title: "Macro",
    href: "/economic",
    icon: Landmark,
    eyebrow: "Economy",
    surfaceCount: "1 surface",
    description: "Economic indicators shaping rates, growth, and inflation.",
    items: [
      {
        title: "Economic Indicators",
        href: "/economic",
        icon: Landmark,
        description: "GDP, CPI, unemployment, and policy signals.",
      },
    ],
  },
  {
    title: "Flows",
    href: "/13f",
    icon: BriefcaseBusiness,
    eyebrow: "Ownership",
    surfaceCount: "2 surfaces",
    description: "Institutional, insider, and congressional trading flows.",
    matchPrefixes: ["/insider-senate"],
    items: [
      {
        title: "13F Holdings",
        href: "/13f",
        icon: BriefcaseBusiness,
        description: "Institutional ownership snapshots and portfolio weights.",
      },
      {
        title: "Insider & Congress",
        href: "/insider-senate",
        icon: Users,
        description: "Form 4, Senate, and House trading disclosures.",
      },
    ],
  },
  {
    title: "Digital Assets",
    href: "/crypto",
    icon: Bitcoin,
    eyebrow: "Crypto",
    surfaceCount: "1 surface",
    description: "Crypto leaders and cross-market risk appetite.",
    items: [
      {
        title: "Crypto",
        href: "/crypto",
        icon: Bitcoin,
        description: "Top digital assets and market trend snapshots.",
      },
    ],
  },
  {
    title: "Portfolio",
    href: "/watchlist",
    icon: Wallet,
    eyebrow: "Execution",
    surfaceCount: "2 surfaces",
    description: "Watchlists, paper trading, and position management.",
    matchPrefixes: ["/trade"],
    items: [
      {
        title: "Watchlist",
        href: "/watchlist",
        icon: Wallet,
        description: "Track live names with alerts and trends.",
      },
      {
        title: "Trade Simulator",
        href: "/trade",
        icon: LineChart,
        description: "Paper trade with charts, news, and position tooling.",
      },
    ],
  },
] as const satisfies readonly NavigationSection[];

export const secondaryLinks = [
  {
    title: "Community",
    href: "/community",
    icon: Users,
    description: "Leaderboards and community features.",
  },
  {
    title: "Learn",
    href: "/learn",
    icon: BookOpen,
    description: "Education and guided learning content.",
  },
] as const satisfies readonly NavigationItem[];

/**
 * @ai-context Shared path matcher so all navigation surfaces highlight consistently.
 */
export function matchesPath(
  pathname: string,
  href: string,
  matchPrefixes: readonly string[] = []
): boolean {
  if (href !== "/" && (pathname === href || pathname.startsWith(`${href}/`))) {
    return true;
  }

  if (href === "/" && pathname === "/") {
    return true;
  }

  return matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * @ai-context Derives the active primary section from the current pathname.
 */
export function getActiveSection(pathname: string): NavigationSection {
  return (
    primarySections.find((section) =>
      matchesPath(pathname, section.href, section.matchPrefixes)
    ) ?? primarySections[0]
  );
}