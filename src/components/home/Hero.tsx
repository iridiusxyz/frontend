import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { MARKETS, TIERS } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";

/**
 * The opening screen, set like a launch page: the lit mark hangs over the centre axis as the one
 * source of light, the claim sits beneath it, and below that the quote ticket is shown as the real
 * product object, caught in the same glow. A hairline stat row and a slim market ticker close it.
 */
const AMOUNT_IN = 10_000;
const MID = 176.4;
const FEE = (AMOUNT_IN * 2) / 10_000;
const NET = AMOUNT_IN - FEE;
const OUT = NET / (MID * 1.001); // open session with a 10 bps half-spread
const SPREAD_COST = NET - OUT * MID;

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const STRIP = [
  { k: "Half-spread", v: "10 bps", s: "Tier A, during the open session" },
  { k: "Protocol fee", v: "2 bps", s: "A separate line on each ticket" },
  { k: "Oracle band", v: "75 bps", s: "Nothing settles beyond it" },
  { k: "Settlement", v: "Atomic", s: "On Robinhood Chain" },
] as const;

const TICKER = "$IRIDIUS";
const ADDRESS = "";
const short = (a: string, head: number, tail: number) => `${a.slice(0, head)}…${a.slice(-tail)}`;

export function Hero() {
  const tape = [...MARKETS, ...MARKETS];

  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-ir-void pt-16">
      {/* Atmosphere: a lit horizon over a mesh floor, placed so the arc glows just under the call to action */}
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[1300px] sm:h-[1350px] md:h-[1380px] lg:h-[1500px]"
        aria-hidden="true"
      >
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[50%_50%]"
        />
        {/* Keep the header and the mark legible against the sky */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ir-void/70 to-transparent" />
        {/* Let the floor fall back into the page */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent via-ir-void/70 to-ir-void" />
      </div>

      <div className="page relative">
        {/* The light source */}
        <div
          className="pointer-events-none relative mx-auto -mb-[78px] aspect-square w-[280px] sm:-mb-[104px] sm:w-[360px] md:-mb-[128px] md:w-[440px] lg:-mb-[168px] lg:w-[520px]"
          aria-hidden="true"
        >
          <div className="glow breathe absolute -inset-[18%] rounded-full" />
          <div className="absolute inset-[22%] rounded-full bg-ir-ice/10 blur-3xl" />
          <Image
            src="/images/mark-hero.png"
            alt=""
            fill
            priority
            quality={85}
            sizes="(min-width: 1024px) 520px, (min-width: 768px) 440px, (min-width: 640px) 360px, 280px"
            className="animate-rise object-contain"
          />
        </div>

        <div className="relative mx-auto max-w-[1100px] text-center">
          {/* <p
            className="animate-rise delay-1 inline-flex max-w-full items-center gap-2.5 rounded-full border border-ir-line-strong bg-ir-ice/[0.05] py-1.5 pl-3 pr-3.5 font-mono text-[11.5px] leading-none text-ir-fg-2 backdrop-blur-sm"
            title={`${TICKER} · ${ADDRESS}`}
          >
            <span className="pulse-dot size-1.5 shrink-0 rounded-full bg-ir-ice shadow-[0_0_10px_1px_rgb(142_182_232/0.7)]" aria-hidden="true" />
            <span className="font-medium text-ir-fg">{TICKER}</span>
            <span className="text-ir-fg-4" aria-hidden="true">·</span>
            <span className="sr-only">{ADDRESS}</span>
            <span className="figure sm:hidden" aria-hidden="true">{short(ADDRESS, 6, 4)}</span>
            <span className="figure hidden sm:inline lg:hidden" aria-hidden="true">{short(ADDRESS, 10, 8)}</span>
            <span className="figure hidden lg:inline" aria-hidden="true">{ADDRESS}</span>
          </p> */}

          <h1 className="h-display animate-rise delay-1 mt-7 text-[clamp(42px,7.6vw,96px)] text-ir-fg">
            Tokenized stocks,
            <br />
            <span className="text-lit">priced as the shares are.</span>
          </h1>

          <p className="animate-rise delay-2 mx-auto mt-7 max-w-[58ch] text-[16px] leading-[1.7] text-ir-fg-2 md:text-[18px]">
            Trade Stock Tokens for USDG at prices pinned to the live Chainlink mid. Each ticket lists
            the spread and the fee on lines of their own, and each fill settles on-chain, open to
            anyone who wants to check it.
          </p>

          <div className="animate-rise delay-3 mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={SITE.appHref} className="btn btn-primary btn-lg">
              Open the venue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="#pricing" className="btn btn-secondary btn-lg">
              Read the formula
            </Link>
          </div>
        </div>

        {/* A beam of light falling onto the ticket */}
        <div
          className="mx-auto mt-14 h-16 w-px bg-gradient-to-b from-transparent via-ir-ice/50 to-ir-ice/0 md:mt-16 md:h-20"
          aria-hidden="true"
        />

        {/* The product object: a live-looking swap ticket */}
        <div className="animate-rise delay-4 relative mx-auto w-full max-w-[468px]">
          <div className="glow pointer-events-none absolute -inset-x-28 -inset-y-20 -z-10 rounded-full" aria-hidden="true" />
          <QuoteTicket />
        </div>

        {/* Four figures */}
        <dl className="mx-auto mt-20 grid max-w-5xl grid-cols-2 border-y border-ir-line md:mt-24 lg:grid-cols-4">
          {STRIP.map((s, i) => (
            <div
              key={s.k}
              className={[
                "px-4 py-7 sm:px-6 lg:py-8",
                i % 2 === 1 ? "border-l border-ir-line" : "",
                i >= 2 ? "border-t border-ir-line lg:border-t-0" : "",
                i === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <dt className="caps">{s.k}</dt>
              <dd className="figure mt-4 text-[clamp(24px,3vw,32px)] leading-none text-ir-fg">{s.v}</dd>
              <dd className="mt-3 text-[13px] leading-snug text-ir-fg-3">{s.s}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The catalogue, running along the base */}
      <div className="mt-16 border-y border-ir-line bg-ir-base/70 md:mt-20">
        <div className="fade-x overflow-hidden py-3.5">
          <div className="marquee" aria-hidden="true">
            {tape.map((m, i) => (
              <span
                key={`${m.symbol}-${i}`}
                className="flex shrink-0 items-center gap-3 px-6 font-mono text-[11.5px] leading-none"
              >
                <span className="font-medium text-ir-fg">{m.symbol}</span>
                <span className="figure text-ir-fg-2">{fmt(m.mid)}</span>
                <span className="text-ir-fg-3">Tier {TIERS[m.tier].label}</span>
                <span className="figure text-ir-ice">{TIERS[m.tier].baseHalfSpreadBps} bps</span>
                <span className="ml-3 size-1 rounded-full bg-ir-steel" />
              </span>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Markets currently listed: {MARKETS.map((m) => `${m.symbol}, tier ${TIERS[m.tier].label}`).join("; ")}.
        </p>
      </div>
    </section>
  );
}

function QuoteTicket() {
  return (
    <div className="card-lit overflow-hidden text-left">
      <div className="card-head px-5 py-3.5">
        <span className="caps">Swap · quote</span>
        <span className="inline-flex h-6 items-center gap-2 rounded-[6px] border border-ir-up/30 bg-ir-up/10 px-2 font-mono text-[11px] text-ir-up">
          <span className="pulse-dot size-1.5 rounded-full bg-ir-up" aria-hidden="true" />
          open ×1.0
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 px-1">
          <span className="caps">Market</span>
          <span className="flex items-center gap-2.5">
            <span className="h-card text-[17px] text-ir-fg">NVDAx / USDG</span>
            <span className="tag">Tier A</span>
          </span>
        </div>

        <div className="relative mt-4 space-y-1.5">
          <TicketField label="You pay" value={fmt(AMOUNT_IN, 0)} symbol="USDG" />
          <span
            className="absolute left-1/2 top-1/2 z-10 inline-flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px] border border-ir-line-strong bg-ir-raised text-ir-ice"
            aria-hidden="true"
          >
            <ArrowDown className="size-4" />
          </span>
          <TicketField label="You receive" value={fmt(OUT, 4)} symbol="NVDAx" lit />
        </div>

        <dl className="mt-4 rounded-[14px] border border-ir-line bg-white/[0.015] px-4 py-1.5">
          <Row k="Chainlink mid" v={`${fmt(MID)} USDG`} />
          <Row k="Spread · 10.0 bps" v={`${fmt(SPREAD_COST)} USDG`} />
          <Row k="Skew" v="+0 bps" />
          <Row k="Protocol fee · 2.0 bps" v={`${fmt(FEE)} USDG`} />
        </dl>

        <Link href={SITE.appHref} className="btn btn-secondary mt-4 w-full rounded-[12px]">
          Trade NVDAx
          <ArrowUpRight className="size-4 text-ir-fg-3" aria-hidden="true" />
        </Link>

        <p className="mt-4 text-center font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-ir-fg-3">
          Held within 75 bps of mid · atomic settlement
        </p>
      </div>
    </div>
  );
}

function TicketField({ label, value, symbol, lit = false }: { label: string; value: string; symbol: string; lit?: boolean }) {
  return (
    <div
      className={[
        "rounded-[14px] border px-4 py-4",
        lit ? "border-ir-ice/25 bg-ir-ice/[0.06]" : "border-ir-line bg-white/[0.025]",
      ].join(" ")}
    >
      <p className={`caps ${lit ? "text-ir-ice" : ""}`}>{label}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="figure min-w-0 truncate text-[clamp(26px,7vw,32px)] leading-none text-ir-fg">{value}</span>
        <span className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-ir-line-strong bg-ir-raised pl-1 pr-3 font-mono text-[12px] text-ir-fg">
          <TokenLogo symbol={symbol} size={24} rounded="round" />
          {symbol}
        </span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ir-line py-2.5 last:border-b-0">
      <dt className="font-mono text-[12px] text-ir-fg-3">{k}</dt>
      <dd className="figure text-[13px] text-ir-fg">{v}</dd>
    </div>
  );
}
