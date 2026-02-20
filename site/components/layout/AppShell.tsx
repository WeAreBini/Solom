import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";

/**
 * @ai-context Global layout shell. Collapsible sidebar + sticky TopNav + mobile bottom nav.
 * Renders the CommandPalette globally so ⌘K works from any page.
 * @ai-related app/layout.tsx, lib/stores/sidebar-store.ts
 */
interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full md:pl-0">
        <TopNav />
        <main
          id="main-content"
          className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden animate-fade-in"
        >
          {children}
        </main>
        <MobileNav />
      </div>
      <CommandPalette />
    </div>
  );
}
