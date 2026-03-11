"use client";

/**
 * @ai-context Top shell bar with live ticker tape, global search, and IA section shortcuts.
 * @ai-related components/layout/AppShell.tsx, lib/navigation.ts, lib/stores/command-store.ts
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandStore } from "@/lib/stores/command-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { getActiveSection, matchesPath, primarySections } from "@/lib/navigation";
import { logout } from "@/app/login/actions";
import { useQuotes } from "@/hooks/use-fmp";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  const { setOpen } = useCommandStore();
  const { setMobileOpen } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);

  const { data: tickerData, isLoading, isError } = useQuotes([
    "SPY",
    "QQQ",
    "IWM",
    "BTCUSD",
    "AAPL",
    "MSFT",
    "NVDA",
    "TSLA",
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
              S
            </div>
            <div className="min-w-0">
              <span className="block leading-none">Solom</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {activeSection.title}
              </span>
            </div>
          </Link>
        </div>

        <div className="hidden min-w-0 items-center gap-6 overflow-hidden whitespace-nowrap md:flex md:flex-1">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-6 animate-marquee">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))
              ) : isError || !tickerData ? (
                <div className="text-sm text-muted-foreground">
                  Failed to load market data
                </div>
              ) : (
                tickerData.map((item) => {
                  const isUp = item.change >= 0;
                  return (
                    <div key={item.symbol} className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-muted-foreground">
                        {item.symbol}
                      </span>
                      <span>${item.price?.toFixed(2)}</span>
                      <span
                        className={cn(
                          "flex items-center text-xs font-medium",
                          isUp ? "text-success" : "text-danger"
                        )}
                      >
                        {isUp ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {isUp ? "+" : ""}
                        {item.changesPercentage?.toFixed(2)}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full max-w-[220px] items-center gap-2 rounded-md border border-border/50 bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:w-64"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden flex-1 text-left sm:inline-block">
              Search markets, macro, flows...
            </span>
            <span className="hidden rounded border border-border/50 bg-background px-1.5 py-0.5 text-xs sm:inline-block">
              ⌘K
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <Avatar className="h-8 w-8 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    U
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium">User</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex cursor-pointer items-center text-danger focus:text-danger"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav
        className="hidden items-center gap-2 overflow-x-auto border-t border-border/60 px-4 py-2 md:flex md:px-6"
        aria-label="Product sections"
      >
        <span className="pr-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Coverage
        </span>
        {primarySections.map((section) => {
          const active = matchesPath(pathname, section.href, section.matchPrefixes);

          return (
            <Link
              key={section.href}
              href={section.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <section.icon className="h-3.5 w-3.5" />
              <span>{section.title}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
