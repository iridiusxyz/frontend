import { Chapter } from "./Chapter";

/** The four facts with a number at their heart, set large. */
const HEADLINE = [
  { label: "Mainnet", fig: "Live", note: "Robinhood Chain since 1 July 2026" },
  { label: "Block time", fig: "~250 ms", note: "100 ms preconfirms" },
  { label: "Median transaction", fig: "~$0.001", note: "gas in ETH" },
  { label: "Assets", fig: "2,000+", note: "Stock Tokens, ERC-20" },
] as const;

/** The rest of the datasheet. */
const SPECS = [
  { label: "Stack", value: "Arbitrum Nitro, EVM-equivalent" },
  { label: "Settlement", value: "Ethereum, blob data availability" },
  { label: "Issuer", value: "Robinhood Assets (Jersey) Ltd, 1:1 backed" },
  { label: "Corporate actions", value: "ERC-8056 uiMultiplier()" },
  { label: "Oracles", value: "Chainlink Feeds + Streams with market status" },
  { label: "Quote asset", value: "USDG (Paxos), MiCA-regulated, native" },
  { label: "Accounts", value: "ERC-4337 + EIP-7702, sponsored first swap" },
  { label: "Explorer", value: "Blockscout, every fill linked" },
] as const;

const REASONS = [
  "Because the stocks are plain ERC-20s, no issuer allowlist sits between a wallet and a swap.",
  "The session flag that drives the regime engine arrives through the oracle, from the very source that prices the fill.",
  "Transactions costing under a cent make small swaps worthwhile and keep quotes fresh at a hundred milliseconds.",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** The venue's underlying chain, laid out as a spec sheet: four headline figures, then the datasheet. */
export function ChainBand() {
  return (
    <Chapter
      id="chain"
      eyebrow="Chain"
      tone="deep"
      title="Built on the chain the assets already call home"
      kicker="No other network has a regulated broker issuing tokenized equities as ordinary ERC-20s, backed by Chainlink feeds, permissionless deployment and the broker's own distribution. Robinhood Chain does."
    >
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HEADLINE.map((h, i) => (
          <div key={h.label} className="card flex min-h-[184px] flex-col p-6">
            <dt className="flex items-center justify-between gap-3">
              <span className="caps">{h.label}</span>
              <span className="figure text-[11px] text-ir-fg-4" aria-hidden="true">
                {pad(i + 1)}
              </span>
            </dt>
            <dd className="mt-auto pt-8">
              <span className="figure block text-[clamp(34px,3.6vw,44px)] font-medium leading-none text-ir-fg">{h.fig}</span>
              <span className="mt-3 block text-[14px] text-ir-fg-3">{h.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="card mt-4 overflow-hidden rounded-[28px]">
        <div className="card-head px-6 md:px-7">
          <span className="caps">Datasheet</span>
          <span className="figure text-[11px] text-ir-fg-4">{pad(HEADLINE.length + 1)} to {pad(HEADLINE.length + SPECS.length)}</span>
        </div>
        <dl className="grid md:grid-cols-2">
          {SPECS.map((s, i) => (
            <div
              key={s.label}
              className={
                "flex items-baseline gap-4 border-ir-line px-6 py-4 md:px-7" +
                (i > 0 ? " border-t" : "") +
                (i === 1 ? " md:border-t-0" : "") +
                (i % 2 === 1 ? " md:border-l" : "")
              }
            >
              <dt className="flex min-w-0 flex-1 items-baseline gap-4">
                <span className="figure w-6 shrink-0 text-[11px] text-ir-fg-4" aria-hidden="true">
                  {pad(HEADLINE.length + i + 1)}
                </span>
                <span className="shrink-0 text-[13.5px] text-ir-fg-3">{s.label}</span>
                <span className="leader !mx-0 hidden sm:block" aria-hidden="true" />
              </dt>
              <dd className="text-right font-mono text-[13px] text-ir-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ol className="mt-14 grid gap-8 md:grid-cols-3">
        {REASONS.map((r, i) => (
          <li key={r} className="relative border-t border-ir-line-strong pt-5">
            <span className="absolute -top-px left-0 h-px w-12 bg-ir-ice" aria-hidden="true" />
            <span className="figure text-[12px] text-ir-ice">{pad(i + 1)}</span>
            <p className="mt-3 text-[15px] leading-[1.65] text-ir-fg-2">{r}</p>
          </li>
        ))}
      </ol>
    </Chapter>
  );
}
