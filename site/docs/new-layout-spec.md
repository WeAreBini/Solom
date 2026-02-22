# Financial Platform UI/UX Layout Specification

## 1. Research & Inspiration
Analysis of top financial and trading platforms reveals key patterns for handling dense data:
*   **Bloomberg Terminal / Thinkorswim**: Prioritize data density, modular panels, and dark backgrounds to reduce eye strain during long trading sessions. They utilize highly customizable grid systems.
*   **TradingView**: Excels in clean typography, distinct toolbars (top for context, sides for tools/navigation), and excellent use of screen real estate.
*   **Robinhood / Webull**: Focus on approachability, clear visual hierarchy, and distinct color coding for market movements (neon green/red). Webull effectively uses a left sidebar for navigation and a right sidebar for order entry.

## 2. Proposed Layout Architecture: Hybrid Approach
To balance professional data density with modern usability, we will implement a **Hybrid Layout**:
*   **Top Navigation Bar (Context & Global)**:
    *   Global Market Ticker (Scrolling or static summary of SPY, QQQ, BTC, etc.)
    *   Global Search (Command+K / Ctrl+K for tickers, users, news)
    *   User Profile, Settings, and Notifications
*   **Left Collapsible Sidebar (Deep Navigation)**:
    *   Collapsible state (icons only) to maximize chart/data space.
    *   Expanded state (icons + text) for discoverability.
    *   Modules: Dashboard, Trade, Options, Crypto, News, Watchlist, Community.
*   **Main Content Area**:
    *   Grid-based layout for widgets (charts, order books, news feeds).
    *   Scrollable independently of the Top Bar and Sidebar.

## 3. Component Structure (Next.js)
The architecture in `site/` should follow this structure:

```tsx
// Proposed Component Tree
<RootLayout>
  <TopBar />
  <div className="flex h-[calc(100vh-topbar_height)]">
    <Sidebar collapsible />
    <main className="flex-1 overflow-y-auto bg-slate-900">
      {children}
    </main>
  </div>
</RootLayout>
```

## 4. Color Palette: Soft Dark Mode
Avoiding harsh pure black (`#000000`) to reduce eye fatigue. Using a Slate-based theme for a cool, professional financial aesthetic.

| Element | Hex Code | Tailwind Equivalent | Description |
| :--- | :--- | :--- | :--- |
| **App Background** | `#0f172a` | `slate-900` | Deep slate for the main application background. |
| **Surface / Cards** | `#1e293b` | `slate-800` | Slightly lighter slate for panels, cards, and sidebars. |
| **Surface Hover** | `#334155` | `slate-700` | Interactive state for buttons and list items. |
| **Borders** | `#334155` | `slate-700` | Subtle dividers between dense data grids. |
| **Text Primary** | `#f8fafc` | `slate-50` | High contrast text for critical data and headings. |
| **Text Secondary** | `#94a3b8` | `slate-400` | Low contrast text for labels, timestamps, and axes. |
| **Primary Accent** | `#3b82f6` | `blue-500` | Brand color, primary buttons, active states. |
| **Success (Up)** | `#10b981` | `emerald-500` | Positive price action, buy buttons, profit. |
| **Danger (Down)** | `#ef4444` | `red-500` | Negative price action, sell buttons, loss. |
| **Warning** | `#f59e0b` | `amber-500` | Alerts, margin warnings, pending orders. |

## 5. Responsive Behavior (Mobile vs. Desktop)
*   **Desktop (> 1024px)**: Sidebar is expanded by default. Top bar shows full ticker. Main content uses multi-column grids.
*   **Tablet (768px - 1024px)**: Sidebar is collapsed by default (icons only). Main content shifts to fewer columns.
*   **Mobile (< 768px)**:
    *   Left Sidebar disappears, replaced by a **Bottom Navigation Bar** (Home, Search, Trade, Portfolio).
    *   Top Bar simplifies to Logo, Search Icon, and Profile.
    *   Data tables become horizontally scrollable or stack into card-based lists.
