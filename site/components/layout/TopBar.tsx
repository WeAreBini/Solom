"use client";

/**
 * @ai-context Compact top navigation bar for global search, user profile, and market ticker.
 * @ai-related components/layout/AppShell.tsx, lib/stores/command-store.ts
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandStore } from "@/lib/stores/command-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { logout } from "@/app/login/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockTicker = [
  { symbol: "SPY", price: "508.12", change: "+0.4%", isUp: true },
  { symbol: "QQQ", price: "438.55", change: "+0.7%", isUp: true },
  { symbol: "IWM", price: "201.14", change: "-0.2%", isUp: false },
  { symbol: "BTC", price: "51,240", change: "+1.5%", isUp: true },
];

export function TopBar() {
  const { setOpen } = useCommandStore();
  const { setMobileOpen } = useSidebarStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Mobile Left: Hamburger + Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-bold text-lg"
        >
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">
            S
          </div>
          <span>Solom</span>
        </Link>
      </div>

      {/* Desktop Left: Market Ticker */}
      <div className="hidden md:flex items-center gap-6 overflow-hidden whitespace-nowrap flex-1">
        <div className="flex items-center gap-6 animate-marquee">
          {mockTicker.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-muted-foreground">{item.symbol}</span>
              <span>${item.price}</span>
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  item.isUp ? "text-success" : "text-danger"
                )}
              >
                {item.isUp ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Search & Profile */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Global Search Trigger */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 rounded-md transition-colors w-full max-w-[200px] md:w-64"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline-block flex-1 text-left">Search...</span>
          <span className="hidden sm:inline-block text-xs bg-background px-1.5 py-0.5 rounded border border-border/50">
            ⌘K
          </span>
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  U
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">User</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:text-danger cursor-pointer flex items-center"
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
    </header>
  );
}
