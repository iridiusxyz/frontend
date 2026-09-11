"use client";

import { useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";
import { currentSession, REGIMES, type Session } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { Chapter } from "./Chapter";

/**
 * One weekday on the venue, plotted as a 24-hour ring in UTC, with each arc sized as minutes / 1440.
 * The schedule runs: 00:00-01:00 extended tail, 01:00-09:00 closed, 09:00-14:30 extended,
 * 14:30-21:00 regular, 21:00-24:00 extended. Once the page is live in the browser, the regime in
 * force right now is lit and a hand marks the current UTC time.
 */
const DAY = [
  { session: "extended", from: 0, minutes: 60 },
  { session: "closed", from: 60, minutes: 480 },
  { session: "extended", from: 540, minutes: 330 },
  { session: "regular", from: 870, minutes: 390 },
  { session: "extended", from: 1260, minutes: 180 },
] as const;

const LEGEND = [
  { session: "regular", label: "Open", spread: "×1.0 spread", clip: "full clip" },
  { session: "extended", label: "Extended", spread: "×1.5 spread", clip: "×0.75 clip" },
  { session: "closed", label: "Closed", spread: "×3.0 spread", clip: "×0.5 clip" },
] as const;

const HALTS = [
  { trigger: "The feed is older than the staleness bound for the session", clears: "a new oracle round" },
  { trigger: "A corporate action, with the feed reporting oraclePaused()", clears: "the feed coming back" },
  { trigger: "One round moves by over 25%", clears: "a published, timelocked review" },
  { trigger: "The sequencer goes down, plus a one-hour recovery grace", clears: "the end of the grace period" },
] as const;

/** State colours, one per regime: open is up, extended is warn, closed is ice, the same reading the venue app gives it. */
const TONE: Record<Session, { stroke: string; fill: string; text: string; bg: string; border: string }> = {
  regular: { stroke: "stroke-ir-up", fill: "fill-ir-up", text: "text-ir-up", bg: "bg-ir-up", border: "border-ir-up/30" },
  extended: { stroke: "stroke-ir-warn", fill: "fill-ir-warn", text: "text-ir-warn", bg: "bg-ir-warn", border: "border-ir-warn/30" },
  closed: { stroke: "stroke-ir-ice", fill: "fill-ir-ice", text: "text-ir-ice", bg: "bg-ir-ice", border: "border-ir-ice/30" },
};

const SIZE = 320;
const MIDPT = SIZE / 2;
const R = 118;
const C = 2 * Math.PI * R;

/** A clock that ticks every 20 seconds on the client and is absent on the server, so hydration matches. */
const TICK = 20_000;
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, TICK);
  return () => window.clearInterval(id);
}
const getSnapshot = () => Math.floor(Date.now() / TICK);
const getServerSnapshot = () => null;

const polar = (minutes: number, r: number) => {
  const a = (minutes / 1440) * 2 * Math.PI - Math.PI / 2;
  // Rounded so the server and the browser serialise identical coordinates.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x: round(MIDPT + r * Math.cos(a)), y: round(MIDPT + r * Math.sin(a)) };
};

export function SessionClock() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tick === null ? null : new Date(tick * TICK);
  const live = now ? currentSession(now) : null;
  const minutes = now ? now.getUTCHours() * 60 + now.getUTCMinutes() : 0;
  const clock = now
    ? `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`
    : "--:--";
  const day = now?.getUTCDay();
  const weekend = day === 0 || day === 6;
  const hand = polar(minutes, R + 14);
  const handIn = polar(minutes, R - 40);

  return (
    <Chapter
      id="sessions"
      eyebrow="Sessions"
      tone="void"
      title="A venue that keeps track of the clock"
      kicker="Stock Tokens trade at all hours, yet equity markets open for only about 32 hours each week. Each market has a regime that prices in that gap, taken from the market status the oracle itself reports."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-8">
        {/* The dial */}
        <div className="card overflow-hidden">
          <div className="card-head">
            <span className="caps">Session clock</span>
            <span className="tag figure">
              {clock} UTC
            </span>
          </div>
          <div className="relative px-6 py-8">
            <div className="glow pointer-events-none absolute inset-10 rounded-full opacity-60" aria-hidden="true" />
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="relative mx-auto w-full max-w-[340px]"
              role="img"
              aria-label="One weekday on the venue in UTC: closed 01:00 to 09:00, then extended to 14:30, open to 21:00, and extended again to 01:00"
            >
              <circle cx={MIDPT} cy={MIDPT} r={R} fill="none" className="stroke-white/[0.04]" strokeWidth="22" />
              <circle cx={MIDPT} cy={MIDPT} r={R - 44} fill="none" className="stroke-ir-line-strong" strokeWidth="1" strokeDasharray="2 5" />
              {DAY.map((seg, i) => {
                const len = (seg.minutes / 1440) * C - 3;
                const start = (seg.from / 1440) * C + 1.5;
                const lit = live === seg.session;
                return (
                  <circle
                    key={i}
                    cx={MIDPT}
                    cy={MIDPT}
                    r={R}
                    fill="none"
                    className={cn(TONE[seg.session].stroke, "transition-opacity duration-500")}
                    strokeOpacity={live === null ? 0.55 : lit ? 1 : 0.18}
                    strokeWidth="22"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-start}
                    transform={`rotate(-90 ${MIDPT} ${MIDPT})`}
                  />
                );
              })}
              {Array.from({ length: 96 }).map((_, q) => {
                const major = q % 24 === 0;
                const hour = q % 4 === 0;
                const a = polar(q * 15, R + 17);
                const b = polar(q * 15, R + (major ? 29 : hour ? 24 : 20));
                return (
                  <line
                    key={q}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={major ? "stroke-ir-fg-3" : "stroke-ir-line-strong"}
                    strokeWidth="1"
                  />
                );
              })}
              {[0, 6, 12, 18].map((h) => {
                const p = polar(h * 60, R - 28);
                return (
                  <text
                    key={h}
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    className="fill-ir-fg-3"
                  >
                    {String(h).padStart(2, "0")}:00
                  </text>
                );
              })}
              {now && (
                <g>
                  <line x1={handIn.x} y1={handIn.y} x2={hand.x} y2={hand.y} className="stroke-ir-ice-bright" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx={hand.x} cy={hand.y} r="4" className="fill-ir-ice-bright" />
                  <circle cx={hand.x} cy={hand.y} r="9" className="fill-ir-ice/20" />
                </g>
              )}
              {live ? (
                <>
                  <text
                    x={MIDPT}
                    y={MIDPT - 8}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="15"
                    letterSpacing="2"
                    className={TONE[live].fill}
                  >
                    {REGIMES[live].label}
                  </text>
                  <text x={MIDPT} y={MIDPT + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" className="fill-ir-fg-3">
                    {weekend ? "WEEKEND · UTC" : "WEEKDAY · UTC"}
                  </text>
                </>
              ) : (
                <>
                  <text x={MIDPT} y={MIDPT - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" letterSpacing="1" className="fill-ir-fg">
                    weekday
                  </text>
                  <text x={MIDPT} y={MIDPT + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" className="fill-ir-fg-3">
                    24H · UTC
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* The regimes */}
        <div className="flex flex-col gap-6">
          <ul className="card divide-hair overflow-hidden">
            {LEGEND.map((l) => {
              const lit = live === l.session;
              return (
                <li
                  key={l.label}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 transition-colors sm:px-6",
                    lit && "bg-white/[0.025]"
                  )}
                >
                  <span className={cn("relative flex size-2.5 rounded-full", TONE[l.session].bg, !lit && live && "opacity-40")} aria-hidden="true">
                    {lit && <span className={cn("pulse-dot absolute -inset-1.5 rounded-full opacity-30", TONE[l.session].bg)} />}
                  </span>
                  <div className="min-w-0">
                    <p className="h-card text-[19px] text-ir-fg">{l.label}</p>
                    <p className="figure mt-1 text-[12.5px] text-ir-fg-3">
                      {l.spread} · {l.clip}
                    </p>
                  </div>
                  {lit ? (
                    <span
                      className={cn(
                        "inline-flex h-6 items-center rounded-[6px] border bg-white/[0.03] px-2 font-mono text-[11px] uppercase tracking-[0.1em]",
                        TONE[l.session].text,
                        TONE[l.session].border
                      )}
                    >
                      Now
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-ir-fg-4">{REGIMES[l.session].label}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="px-1 text-[15px] leading-relaxed text-ir-fg-2">
            Saturdays and Sundays count as closed from start to finish: quotes keep coming at ×3.0 with half
            the clip, and the ticket makes that clear. Declining to quote would bring market hours back to a
            chain that runs 24/7, while pricing weekend trades at weekday spreads would leave LPs as the unpaid
            counterparty to every Monday gap. When your trade can hold until the open, holding costs less, and
            the venue lets you know.
          </p>
        </div>
      </div>

      {/* Fault table */}
      <div className="card mt-6 overflow-hidden lg:mt-8">
        <div className="card-head px-5 py-4 sm:px-6">
          <h3 className="h-card text-[18px] text-ir-fg sm:text-[20px]">When quoting halts completely</h3>
          <span className="tag figure shrink-0">0{HALTS.length}</span>
        </div>
        <ol className="divide-hair">
          {HALTS.map((h, i) => (
            <li
              key={h.trigger}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6"
            >
              <span className="figure text-[12px] text-ir-fg-3">0{i + 1}</span>
              <span className="text-[15px] leading-relaxed text-ir-fg-2">{h.trigger}</span>
              <span className="justify-self-start rounded-[6px] border border-ir-ice/25 bg-ir-ice/[0.06] px-2.5 py-1.5 font-mono text-[11.5px] leading-snug text-ir-ice sm:justify-self-end">
                clears on {h.clears}
              </span>
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-2.5 border-t border-ir-line bg-white/[0.015] px-5 py-3.5 text-[13.5px] text-ir-fg-3 sm:px-6">
          <ShieldCheck className="size-4 shrink-0 text-ir-ice" aria-hidden="true" />
          A halt only stops pricing. LP withdrawals keep working regardless.
        </p>
      </div>
    </Chapter>
  );
}
