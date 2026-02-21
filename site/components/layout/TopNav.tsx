"use client";

/**
 * @ai-context Sticky top navigation bar with search trigger, theme toggle,
 * notification bell, and user avatar dropdown.
 * On mobile: shows hamburger + Solom logo on the left.
 * @ai-related components/layout/AppShell.tsx, lib/stores/command-store.ts, lib/stores/sidebar-store.ts
 * @ai-mutates useCommandStore (opens palette), useSidebarStore (mobile sheet)
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  Monitor,
  User,
  Settings,
  LogOut,
  ChevronRight,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopNav() {
  const { setOpen } = useCommandStore();
  const { setMobileOpen } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  /** Cycle through light → dark → system */
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  /** Resolve the icon to show for the current theme */
  const ThemeIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  /** Generate breadcrumbs from pathname */
  const generateBreadcrumbs = () => {
    if (!pathname || pathname === "/") return [{ name: "Dashboard", href: "/dashboard" }];
    
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return { name, href };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b backdrop-blur-lg bg-background/80 px-4 md:px-6">
        {/* ── Left: mobile hamburger + logo / desktop breadcrumbs ──────────────── */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors press-scale"
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

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
              <Link
                href={crumb.href}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === breadcrumbs.length - 1 && "text-foreground font-semibold"
                )}
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>

        {/* ── Center: search trigger ─────────────── */}
        <div className="flex-1 flex justify-end md:justify-center md:max-w-2xl ml-auto md:ml-0 px-2 md:px-4">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full max-w-[200px] md:max-w-lg items-center gap-2 rounded-md border bg-surface/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-hover transition-colors cursor-pointer shadow-sm"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">
              Search symbols, pages...
            </span>
            <span className="sm:hidden">Search</span>
            <kbd className="ml-auto hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Right: actions ──────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={cycleTheme}
                className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors press-scale"
                aria-label="Toggle theme"
              >
                <ThemeIcon className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          {/* Notification bell */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors press-scale"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {/* Animated pulse dot */}
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive pulse-dot" />
                <span className="sr-only">Notifications</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center press-scale"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form
                  action={async () => {
                    await logout();
                  }}
                  className="w-full"
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
