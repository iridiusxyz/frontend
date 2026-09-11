import { Cpu, RotateCcw, Scale } from "lucide-react";
import { Chapter } from "./Chapter";

const MID = 176.4;
const PRICE = (MID * 1.001) / (1 - 0.0002); // half-spread applied to the mid, fee taken from the quote side
const BAND_BPS = 75;
const PRICE_BPS = ((PRICE - MID) / MID) * 10_000; // where the worked price sits inside the band

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const LINES = [
  {
    op: "",
    term: "mid",
    figure: `${fmt(MID)} USDG`,
    note: "The Chainlink price, behind guards. A zero, stale or implausible round stops the market rather than setting a price.",
  },
  {
    op: "+",
    term: "spread × regime",
    figure: "10.0 bps × 1.0",
    note: "The half-spread for the tier (10 bps in Tier A), multiplied by the session factor: ×1.0 when open, ×1.5 in extended hours, ×3.0 when closed.",
  },
  {
    op: "±",
    term: "skew",
    figure: "+0 bps",
    note: "When a vault drifts from its 50/50 inventory target, it tightens the side that brings it back, by up to ±15 bps.",
  },
  {
    op: "+",
    term: "fee",
    figure: "2.0 bps",
    note: "Given a separate line on the ticket and logged in the fill event. It is never buried in the curve.",
  },
] as const;

const GUARANTEES = [
  {
    icon: Cpu,
    title: "The chain recomputes it",
    body: "Within your transaction, the router rebuilds the vault quote from oracle and vault state, so no front end can send you to a price worse than the formula gives.",
  },
  {
    icon: Scale,
    title: "Makers have to beat it",
    body: "A signed RFQ quote from an attested maker settles only if it pays you more than the vault does. Losing is free for them, so they keep quoting.",
  },
  {
    icon: RotateCcw,
    title: "A worse price reverts",
    body: "Your signature carries your slippage bound and deadline. Should state move beyond either before inclusion, the swap reverts instead of filling.",
  },
] as const;

/** An operator sitting in the gutter between two terms: above the card when stacked, to its left in a row. */
function Operator({ op }: { op: string }) {
  return (
    <span
      className="absolute left-1/2 top-0 z-10 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ir-line-strong bg-ir-base font-mono text-[15px] leading-none text-ir-ice lg:-left-2 lg:top-1/2 lg:-translate-x-1/2"
      aria-hidden="true"
    >
      {op}
    </span>
  );
}

export function PricingLedger() {
  const marker = 50 + (PRICE_BPS / BAND_BPS) * 50; // percent along a -75 to +75 bps track

  return (
    <Chapter
      id="pricing"
      eyebrow="Pricing"
      tone="deep"
      title="A single formula, published in full"
      kicker="Each quote on Iridius comes from identical arithmetic applied to public state, so anyone can rebuild any price from on-chain inputs."
    >
      {/* The equation, written out once as a spec line */}
      <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="caps">Quote formula</span>
        <p className="figure text-[clamp(14px,1.9vw,18px)] leading-relaxed text-ir-fg">
          your price <span className="text-ir-ice">=</span> mid <span className="text-ir-ice">+</span> spread{" "}
          <span className="text-ir-ice">×</span> regime <span className="text-ir-ice">±</span> skew{" "}
          <span className="text-ir-ice">+</span> fee
        </p>
      </div>

      {/* Each term as its own plate */}
      <ol className="mt-8 grid gap-6 lg:mt-4 lg:grid-cols-4 lg:gap-4">
        {LINES.map((l, i) => (
          <li key={l.term} className="card relative flex flex-col p-6">
            {l.op && <Operator op={l.op} />}
            <div className="flex items-center justify-between gap-3">
              <span className="caps text-ir-fg-2">{l.term}</span>
              <span className="font-mono text-[11px] text-ir-fg-4">T{i + 1}</span>
            </div>
            <p className="figure mt-5 text-[24px] leading-none text-ir-fg">{l.figure}</p>
            <div className="rule my-5" />
            <p className="text-[14.5px] leading-relaxed text-ir-fg-2">{l.note}</p>
          </li>
        ))}
      </ol>

      {/* The result, held inside its band */}
      <div className="card-lit relative mt-6 grid gap-8 p-6 sm:p-8 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <span
          className="absolute left-1/2 top-0 z-10 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ir-ice/40 bg-ir-base font-mono text-[15px] leading-none text-ir-ice-bright"
          aria-hidden="true"
        >
          =
        </span>
        <div>
          <span className="caps text-ir-ice">your price</span>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="figure text-[clamp(40px,6vw,60px)] leading-none text-ir-fg">{fmt(PRICE)}</span>
            <span className="font-mono text-[13px] text-ir-fg-3">USDG</span>
          </p>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ir-fg-2">
            Held inside a hard band: whatever fails upstream, no fill settles further than 75 bps from the mid.
          </p>
        </div>

        <figure aria-label={`The price sits ${PRICE_BPS.toFixed(1)} bps above the mid, inside a band of ${BAND_BPS} bps either side`}>
          <div className="flex justify-between font-mono text-[11px] text-ir-fg-3" aria-hidden="true">
            <span>-{BAND_BPS} bps</span>
            <span>mid</span>
            <span>+{BAND_BPS} bps</span>
          </div>
          <div className="relative mt-3 h-12" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full border border-ir-line-strong bg-white/[0.03]" />
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ir-line-strong"
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}
            <span className="absolute left-1/2 top-0 h-full w-px bg-ir-fg-3" />
            <span
              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ir-ice/50"
              style={{ left: "50%", width: `${marker - 50}%` }}
            />
            <span
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ir-void bg-ir-ice-bright shadow-[0_0_14px_2px_rgb(142_182_232/0.6)]"
              style={{ left: `${marker}%` }}
            />
          </div>
          <figcaption className="mt-3 flex items-center justify-between gap-4 font-mono text-[11.5px]">
            <span className="text-ir-fg-3">{fmt(MID)} mid</span>
            <span className="figure text-ir-fg">+{PRICE_BPS.toFixed(1)} bps</span>
          </figcaption>
        </figure>
      </div>

      <ol className="mt-16 grid gap-4 md:grid-cols-3">
        {GUARANTEES.map((g, i) => (
          <li key={g.title} className="card p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-[12px] border border-ir-line-strong bg-white/[0.03]">
                <g.icon className="size-[18px] text-ir-ice" aria-hidden="true" />
              </span>
              <span className="caps">Guarantee 0{i + 1}</span>
            </div>
            <h3 className="h-card mt-6 text-[20px] text-ir-fg">{g.title}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ir-fg-2">{g.body}</p>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}
