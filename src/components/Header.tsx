"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GitHubIcon, XIcon } from "@/components/icons";
import { HEADER_LINKS, NAV_LINKS, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * A slim bar that starts transparent over the hero and turns to frosted glass once the page
 * scrolls: mark on the left, sections in the middle, the way into the venue on the right.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-ir-line bg-ir-void/75 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="page flex h-16 items-center justify-between gap-6">
        <Logo size={28} withImage={false} />

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {HEADER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[13.5px] text-ir-fg-2 transition-colors hover:bg-white/[0.04] hover:text-ir-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <a
            href={SITE.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Iridius on X (${SITE.xHandle})`}
            className="inline-flex size-9 items-center justify-center rounded-full text-ir-fg-3 transition-colors hover:bg-white/[0.04] hover:text-ir-fg"
          >
            <XIcon className="size-3.5" />
          </a>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Iridius on GitHub"
            className="mr-2 inline-flex size-9 items-center justify-center rounded-full text-ir-fg-3 transition-colors hover:bg-white/[0.04] hover:text-ir-fg"
          >
            <GitHubIcon className="size-4" />
          </a>
          <Link href={SITE.appHref} className="btn btn-primary btn-sm">
            Launch app
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-full border border-ir-line-strong text-ir-fg lg:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      <div id="mobile-nav" className={cn("lg:hidden", open ? "block" : "hidden")}>
        <div className="page pb-6 pt-2">
          <ul className="divide-hair">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-3.5 font-display text-[17px] font-medium tracking-tight text-ir-fg"
                >
                  <span className="font-mono text-[11px] tracking-normal text-ir-fg-4">{link.no}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={SITE.appHref} className="btn btn-primary w-full" onClick={() => setOpen(false)}>
              Launch app
            </Link>
            <div className="flex gap-2">
              <a href={SITE.xUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
                {SITE.xHandle}
              </a>
              <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
