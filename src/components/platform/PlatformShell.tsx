"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Droplets,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useSession } from "./PlatformProviders";
import { useNow } from "./usePlatformData";
import { shortAddress } from "@/lib/platform/format";
import { REGIMES, currentSession } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const GROUPS: readonly { label: string; items: readonly NavItem[] }[] = [
  {
    label: "Trade",
    items: [
      { href: "/platform", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/platform/swap", label: "Swap", icon: ArrowRightLeft },
      { href: "/platform/liquidity", label: "Liquidity", icon: Droplets },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/platform/portfolio", label: "Portfolio", icon: Briefcase },
      { href: "/platform/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Transparency",
    items: [{ href: "/platform/explorer", label: "Explorer", icon: Search }],
  },
];

const NAV: NavItem[] = GROUPS.flatMap((g) => [...g.items]);

const SESSION_TEXT = {
  regular: "text-ir-up",
  extended: "text-ir-warn",
  closed: "text-ir-ice",
} as const;

const SESSION_DOT = {
  regular: "bg-ir-up shadow-[0_0_10px_1px_rgb(95_208_165/0.6)]",
  extended: "bg-ir-warn shadow-[0_0_10px_1px_rgb(233_189_114/0.55)]",
  closed: "bg-ir-ice shadow-[0_0_10px_1px_rgb(142_182_232/0.6)]",
} as const;

const SESSION_NAME = { regular: "Open", extended: "Extended", closed: "Closed" } as const;

function utcClock(now: number) {
  const d = new Date(now);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/**
 * The venue's chrome. On desktop a fixed sidebar holds the mark and the grouped destinations, and a
 * sticky top bar over the content carries the breadcrumb, the live session and the account. Below
 * the lg breakpoint the sidebar becomes a drawer opened from a compact top bar.
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, authenticated, walletAddress, email, login, logout, sessionError } = useSession();
  const now = useNow();
  const session = currentSession(new Date(now));
  const regime = REGIMES[session];
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const current = NAV.find((item) => isActive(item.href, item.exact));
  const group = GROUPS.find((g) => g.items.some((i) => i.href === current?.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const nav = (
    <nav aria-label="Platform" className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-2 text-[11.5px] font-medium text-ir-fg-4">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-[9px] px-3 text-[13.5px] font-medium transition-colors",
                      active ? "bg-white/[0.06] text-ir-fg" : "text-ir-fg-3 hover:bg-white/[0.035] hover:text-ir-fg"
                    )}
                  >
                    {active && (
                      <span
                        className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-ir-ice shadow-[0_0_10px_2px_rgb(142_182_232/0.5)]"
                        aria-hidden="true"
                      />
                    )}
                    <item.icon
                      className={cn("size-4 shrink-0 transition-colors", active ? "text-ir-ice" : "text-ir-fg-4 group-hover:text-ir-fg-3")}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sessionPill = (compact = false) => (
    <div
      className="flex h-8 items-center gap-2 rounded-full border border-ir-line bg-white/[0.02] px-3 text-[12.5px]"
      title={`Spreads ×${(regime.spreadMulBps / 10_000).toFixed(1)}, clips ×${(regime.clipMulBps / 10_000).toFixed(2)}`}
    >
      <span className={cn("pulse-dot size-1.5 rounded-full", SESSION_DOT[session])} aria-hidden="true" />
      <span className={cn("font-medium", SESSION_TEXT[session])}>
        <span className="sr-only">US equity session: </span>
        {SESSION_NAME[session]}
      </span>
      {!compact && (
        <>
          <span className="h-3 w-px bg-ir-line-strong" aria-hidden="true" />
          <span className="num text-ir-fg-3">spread ×{(regime.spreadMulBps / 10_000).toFixed(1)}</span>
          <span className="h-3 w-px bg-ir-line-strong" aria-hidden="true" />
          <span className="num text-ir-fg-3" suppressHydrationWarning>
            {utcClock(now)} UTC
          </span>
        </>
      )}
    </div>
  );

  const accountButton = !ready ? (
    <div className="h-8 w-28 animate-pulse rounded-full bg-ir-surface" />
  ) : authenticated ? (
    <div className="flex h-8 items-center gap-2 rounded-full border border-ir-line bg-white/[0.02] pl-1 pr-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-b from-ir-ice/40 to-ir-ice-deep/40" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-ir-ice-bright" />
      </span>
      <span className="num text-[12.5px] text-ir-fg">{shortAddress(walletAddress)}</span>
    </div>
  ) : (
    <button type="button" onClick={login} className="btn btn-primary btn-sm h-8">
      Sign in
    </button>
  );

  const account = !ready ? (
    <div className="h-[52px] animate-pulse rounded-[12px] bg-ir-surface" />
  ) : authenticated ? (
    <div className="flex items-center gap-3 rounded-[12px] p-2 pl-2.5 transition-colors hover:bg-white/[0.03]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-ir-ice/35 to-ir-ice-deep/35" aria-hidden="true">
        <span className="size-2 rounded-full bg-ir-ice-bright" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="num truncate text-[13px] text-ir-fg">{shortAddress(walletAddress)}</div>
        <div className="truncate text-[12px] text-ir-fg-4">{email ?? "Wallet connected"}</div>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] text-ir-fg-4 transition-colors hover:bg-white/[0.05] hover:text-ir-fg"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  ) : (
    // On desktop the top bar carries the sign-in button, so the rail only needs it inside the mobile drawer.
    <button type="button" onClick={login} className="btn btn-primary w-full lg:hidden">
      Sign in
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </button>
  );

  const rail = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Logo size={26} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">{nav}</div>
      <div className="space-y-2 border-t border-ir-line p-3">
        <Link
          href="/"
          onClick={close}
          className="flex h-9 items-center gap-3 rounded-[9px] px-3 text-[13px] text-ir-fg-3 transition-colors hover:bg-white/[0.035] hover:text-ir-fg"
        >
          <ArrowLeft className="size-4 text-ir-fg-4" aria-hidden="true" />
          Back to the website
        </Link>
        {account}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ir-void">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-ir-line bg-ir-base lg:block">{rail}</aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-ir-line bg-ir-void/85 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={26} withWordmark={false} />
            <span className="h-4 w-px bg-ir-line-strong" aria-hidden="true" />
            <span className="truncate text-[14px] font-medium text-ir-fg">{current?.label ?? "Platform"}</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionPill(true)}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="platform-drawer"
              className="inline-flex size-10 items-center justify-center rounded-[10px] border border-ir-line text-ir-fg-2 transition-colors hover:bg-white/[0.05] hover:text-ir-fg"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={close}
          className={cn("absolute inset-0 bg-ir-void/70 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <div
          id="platform-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Platform menu"
          inert={!open}
          className={cn(
            "absolute inset-y-0 left-0 w-[86%] max-w-[300px] border-r border-ir-line bg-ir-base transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-2 z-10 inline-flex size-10 items-center justify-center rounded-[10px] text-ir-fg-3 transition-colors hover:bg-white/[0.05] hover:text-ir-fg"
          >
            <X className="size-[18px]" />
          </button>
          {rail}
        </div>
      </div>

      <div className="lg:pl-[240px]">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden h-14 border-b border-ir-line bg-ir-void/80 backdrop-blur-xl backdrop-saturate-150 lg:block">
          <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-8">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13.5px]">
              <span className="text-ir-fg-4">{group?.label ?? "Platform"}</span>
              <ChevronRight className="size-3.5 text-ir-fg-4" aria-hidden="true" />
              <span className="truncate font-medium text-ir-fg">{current?.label ?? "Overview"}</span>
            </nav>
            <div className="flex items-center gap-2">
              {sessionPill()}
              {accountButton}
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgb(79_109_151/0.12),transparent_70%)]"
            aria-hidden="true"
          />
          {sessionError && (
            <div
              role="alert"
              className="mb-6 flex gap-3 rounded-[12px] border border-ir-down/30 bg-ir-down/[0.07] px-4 py-3 text-[13.5px] text-ir-down"
            >
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ir-down" aria-hidden="true" />
              {sessionError}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

/** A gate that prompts the visitor to sign in before any account-specific content is shown. */
export function RequireAuth({ children, title, body }: { children: React.ReactNode; title?: string; body?: string }) {
  const { ready, authenticated, login } = useSession();
  if (!ready) return <div className="h-48 animate-pulse rounded-[18px] bg-ir-surface" />;
  if (!authenticated) {
    return (
      <div className="panel relative overflow-hidden">
        <div className="glow pointer-events-none absolute -right-20 -top-24 size-80" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-4 p-6 md:p-10">
          <span className="flex size-10 items-center justify-center rounded-[12px] border border-ir-line-strong bg-ir-raised" aria-hidden="true">
            <span className="size-2 rounded-full bg-ir-ice shadow-[0_0_10px_2px_rgb(142_182_232/0.6)]" />
          </span>
          <h2 className="font-display text-[22px] font-medium tracking-[-0.02em] text-ir-fg">{title ?? "Sign in to carry on"}</h2>
          <p className="max-w-xl text-[14px] leading-relaxed text-ir-fg-3">
            {body ?? "Sign in with your email, a social account or any EVM wallet. If you have no wallet, one is created for you on Robinhood Chain, and that address is where your swaps settle."}
          </p>
          <button type="button" onClick={login} className="btn btn-primary mt-1">
            Sign in
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
