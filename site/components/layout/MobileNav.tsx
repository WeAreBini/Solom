"use client";

/**
 * @ai-context Mobile bottom navigation with 5 primary tabs + "More" sheet overlay.
 * The "More" sheet shows remaining navigation items not in the tab bar.
 * @ai-related components/layout/AppShell.tsx, components/layout/Sidebar.tsx
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Star,
  CalendarDays,
  MoreHorizontal,
  Briefcase,
  Building2,
  Globe,
  MessageSquare,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { LucideIcon } from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

/* ── Primary bottom tabs ─────────────────────────────────── */
const primaryTabs: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Market", href: "/market", icon: LineChart },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Earnings", href: "/earnings", icon: CalendarDays },
];

/* ── Overflow items shown in the "More" sheet ────────────── */
const moreItems: NavItem[] = [
  { name: "13F Holdings", href: "/13f", icon: Briefcase },
  { name: "Insider/Congress", href: "/insider-senate", icon: Building2 },
  { name: "Economic", href: "/economic", icon: Globe },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Rankings", href: "/ranks", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

/* ── Active state helper ─────────────────────────────────── */
function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Check if any overflow item is active (highlights "More" tab) */
function isMoreActive(pathname: string): boolean {
  return moreItems.some((item) => isActive(pathname, item.href));
}

/* ── MobileNav component ─────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-lg bg-background/80 pb-safe"
        aria-label="Mobile navigation"
      >
        <div className="flex w-full justify-around items-center h-16">
          {primaryTabs.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-full gap-0.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active dot indicator above icon */}
                {active && (
                  <span className="absolute top-1.5 h-1 w-1 rounded-full bg-primary" />
                )}
                <item.icon
                  className={cn("h-5 w-5", active && "fill-primary/20")}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* "More" tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-0.5 text-[11px] font-medium transition-colors",
              isMoreActive(pathname)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="More navigation options"
          >
            {isMoreActive(pathname) && (
              <span className="absolute top-1.5 h-1 w-1 rounded-full bg-primary" />
            )}
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ── "More" bottom sheet ────────────────────────────── */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <SheetHeader className="pb-2">
            <SheetTitle>More</SheetTitle>
            <SheetDescription className="sr-only">
              Additional navigation links
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-1" aria-label="More navigation">
            {moreItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
