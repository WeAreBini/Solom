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
      { name: "Market", href: "/market", icon: LineChart },
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
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <div className="flex items-center h-16 px-4 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shrink-0">
              S
            </div>
            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden animate-fade-in">
                Solom
              </span>
            )}
          </Link>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* ── Nav groups ─────────────────────────────────── */}
        <ScrollArea className="flex-1 py-2">
          <nav aria-label="Main navigation" className="flex flex-col gap-1 px-2">
            {navGroups.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && (
                  <Separator className="my-2 bg-sidebar-border" />
                )}

                {/* Section header (hidden when collapsed) */}
                {!collapsed && (
                  <span className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
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
                        "relative flex items-center gap-3 rounded-md text-sm font-medium transition-colors press-scale",
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "px-3 py-2",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {/* Active left border indicator */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                      )}
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );

                  /* Wrap in tooltip when collapsed */
                  if (collapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">
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
            <Separator className="my-2 bg-sidebar-border" />
            {(() => {
              const active = isActive(pathname, profileItem.href);
              const profileLink = (
                <Link
                  href={profileItem.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md text-sm font-medium transition-colors press-scale",
                    collapsed
                      ? "justify-center px-2 py-2.5"
                      : "px-3 py-2",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                  )}
                  <profileItem.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{profileItem.name}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{profileLink}</TooltipTrigger>
                    <TooltipContent side="right">
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
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center justify-center h-12 shrink-0">
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors press-scale"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
