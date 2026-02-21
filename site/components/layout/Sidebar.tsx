"use client";

/**
 * @ai-context Collapsible desktop sidebar with grouped navigation sections.
 * Uses Zustand for collapse state persisted to localStorage.
 * Hidden on mobile — MobileNav handles that via Sheet.
 * @ai-related lib/stores/sidebar-store.ts, components/layout/AppShell.tsx
 * @ai-mutates useSidebarStore (collapsed toggle)
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Star,
  CalendarDays,
  Briefcase,
  Building2,
  Globe,
  MessageSquare,
  Trophy,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  Bitcoin,
  Coins,
  GraduationCap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

/* ── Nav item type ───────────────────────────────────────── */
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

/* ── Grouped navigation sections ─────────────────────────── */
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Trade", href: "/trade", icon: LineChart },
      { name: "Discover", href: "/discover", icon: Compass },
      { name: "Market", href: "/market", icon: LineChart },
      { name: "Crypto", href: "/crypto", icon: Bitcoin },
      { name: "Earn", href: "/earn", icon: Coins },
    ],
  },
  {
    label: "Tracking",
    items: [
      { name: "Watchlist", href: "/watchlist", icon: Star },
      { name: "Earnings", href: "/earnings", icon: CalendarDays },
    ],
  },
  {
    label: "Research",
    items: [
      { name: "13F Holdings", href: "/13f", icon: Briefcase },
      { name: "Insider/Congress", href: "/insider-senate", icon: Building2 },
      { name: "Economic", href: "/economic", icon: Globe },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "AI Chat", href: "/chat", icon: MessageSquare },
      { name: "Rankings", href: "/ranks", icon: Trophy },
    ],
  },
  {
    label: "Community & Learn",
    items: [
      { name: "Learn to Earn", href: "/learn", icon: GraduationCap },
      { name: "Community", href: "/community", icon: Users },
    ],
  },
];

/** Flat profile link rendered at the bottom of the sidebar */
const profileItem: NavItem = {
  name: "Profile",
  href: "/profile",
  icon: User,
};

/* ── Helper: check active state ──────────────────────────── */
function isActive(pathname: string, href: string): boolean {
  // Dashboard matches both "/" and "/dashboard"
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Sidebar component ───────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-30",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <div className="flex items-center h-14 px-3 shrink-0">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-bold text-xl transition-all",
              collapsed ? "justify-center w-full" : "px-1"
            )}
          >
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              S
            </div>
            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden animate-fade-in tracking-tight">
                Solom
              </span>
            )}
          </Link>
        </div>

        <Separator className="bg-sidebar-border/50" />

        {/* ── Nav groups ─────────────────────────────────── */}
        <ScrollArea className="flex-1 py-3">
          <nav aria-label="Main navigation" className="flex flex-col gap-1.5 px-2">
            {navGroups.map((group, gi) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                {gi > 0 && (
                  <Separator className="my-2 bg-sidebar-border/50" />
                )}

                {/* Section header (hidden when collapsed) */}
                {!collapsed && (
                  <span className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 select-none">
                    {group.label}
                  </span>
                )}

                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const linkContent = (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 group",
                        collapsed
                          ? "justify-center h-10 w-10 mx-auto"
                          : "px-3 py-2",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {/* Active left border indicator */}
                      {active && (
                        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                      )}
                      <item.icon className={cn(
                        "shrink-0 transition-colors",
                        collapsed ? "w-5 h-5" : "w-4 h-4",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                      )} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );

                  /* Wrap in tooltip when collapsed */
                  if (collapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <div key={item.name}>{linkContent}</div>;
                })}
              </div>
            ))}

            {/* ── Profile link ─────────────────────────────── */}
            <Separator className="my-3 bg-sidebar-border/50" />
            {(() => {
              const active = isActive(pathname, profileItem.href);
              const profileLink = (
                <Link
                  href={profileItem.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 group",
                    collapsed
                      ? "justify-center h-10 w-10 mx-auto"
                      : "px-3 py-2",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                  )}
                  <profileItem.icon className={cn(
                    "shrink-0 transition-colors",
                    collapsed ? "w-5 h-5" : "w-4 h-4",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )} />
                  {!collapsed && <span>{profileItem.name}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{profileLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {profileItem.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return profileLink;
            })()}
          </nav>
        </ScrollArea>

        {/* ── Collapse toggle ───────────────────────────── */}
        <Separator className="bg-sidebar-border/50" />
        <div className="flex items-center justify-center h-14 shrink-0">
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200",
              collapsed ? "w-10 h-10" : "w-full mx-3 h-10 gap-2 bg-sidebar-accent/30"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
