"use client";

/**
 * @ai-context Mobile bottom navigation with 5 primary tabs including a prominent center Trade button.
 * @ai-related components/layout/AppShell.tsx, components/layout/Sidebar.tsx
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Star,
  ArrowRightLeft,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex w-full justify-around items-center h-16 px-2">
        {/* Home */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className={cn("h-5 w-5", isActive("/dashboard") && "fill-primary/20")} />
          <span>Home</span>
        </Link>

        {/* Watchlist */}
        <Link
          href="/watchlist"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            isActive("/watchlist") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className={cn("h-5 w-5", isActive("/watchlist") && "fill-primary/20")} />
          <span>Watchlist</span>
        </Link>

        {/* Trade (Center Prominent Button) */}
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <Link
            href="/trade"
            className="absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 ring-4 ring-card"
            aria-label="Trade"
          >
            <ArrowRightLeft className="h-6 w-6" />
          </Link>
          <span className="mt-auto mb-1 text-[10px] font-medium text-muted-foreground">
            Trade
          </span>
        </div>

        {/* Community */}
        <Link
          href="/community"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            isActive("/community") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className={cn("h-5 w-5", isActive("/community") && "fill-primary/20")} />
          <span>Community</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
            isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className={cn("h-5 w-5", isActive("/profile") && "fill-primary/20")} />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
