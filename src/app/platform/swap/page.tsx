"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownUp, Info } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  Button,
  LeaderRow,
  Notice,
  PageHead,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  sessionTone,
} from "@/components/platform/ui";
import { fmtBps, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession, quoteSwap } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";

const SLIPPAGE_OPTIONS = [10, 15, 30, 50] as const;
const SLIPPAGE_SEGMENTS = SLIPPAGE_OPTIONS.map((bps) => ({ value: String(bps), label: `${(bps / 100).toFixed(2)}%` }));

const TITLE = "Your quote doubles as the invoice";
const DESCRIPTION =
  "Each line on the ticket shows the pricing formula openly. The chain enforces exactly what you sign, and anything worse than your bound reverts rather than fills.";

/** The market or token logo: a tile in headers, a round mark inside token chips. */
function Monogram({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" }) {
  return size === "sm" ? <TokenLogo symbol={symbol} size={26} rounded="round" /> : <TokenLogo symbol={symbol} size={32} />;
}

/** A token chip that sits on the right of an amount field. */
function TokenChip({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-ir-line-strong bg-ir-raised pl-1.5 pr-3.5">
      <Monogram symbol={symbol} size="sm" />
      <span className="text-[14px] font-medium text-ir-fg">{symbol}</span>
    </span>
  );
}

function SwapSkeleton() {
  return (
    <div className="space-y-8">
      <PageHead code="IR · 02 · Swap" title={TITLE} description={DESCRIPTION} />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,520px)_320px] lg:justify-center">
        <div className="card-lit p-6">
          <Skeleton rows={8} />
        </div>
        <div className="panel p-5">
          <Skeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export default function SwapPage() {
  return (
    <Suspense fallback={<SwapSkeleton />}>
      <SwapRoute />
    </Suspense>
  );
}

/** Reads the `?market=` deep link and remounts the ticket when it changes. */
function SwapRoute() {
  const requested = useSearchParams().get("market");
  return <SwapTicket key={requested ?? ""} requested={requested} />;
}

function SwapTicket({ requested }: { requested: string | null }) {
  const { authenticated, login } = useSession();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const regime = REGIMES[session];

  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [buyToken, setBuyToken] = useState(true);
  const [amountRaw, setAmountRaw] = useState("10000");
  const [slippageBps, setSlippageBps] = useState(15);

  // An explicit pick wins; otherwise the deep link (if it names a listed market); otherwise the first market.
  const linked = requested ? markets.find((m) => m.symbol.toLowerCase() === requested.toLowerCase()) : undefined;
  const market = markets.find((m) => m.symbol === symbol) ?? linked ?? markets[0];
  const amountIn = Number(amountRaw.replace(/,/g, ""));
  const quote = useMemo(
    () => (market ? quoteSwap(market, buyToken, amountIn, session) : null),
    [market, buyToken, amountIn, session]
  );

  if (venue.loading && !venue.data) return <SwapSkeleton />;
  if (!market || !quote) return null;

  const tier = TIERS[market.tier];
  const minOut = quote.ok ? quote.amountOut * (1 - slippageBps / 10_000) : 0;
  const inSymbol = buyToken ? QUOTE_SYMBOL : market.symbol;
  const outSymbol = buyToken ? market.symbol : QUOTE_SYMBOL;
  const outDigits = buyToken ? 4 : 2;
  const regimeMul = (regime.spreadMulBps / 10_000).toFixed(1);
  const sessionHalfSpread = (tier.baseHalfSpreadBps * regime.spreadMulBps) / 10_000;

  const unit = (s: string) => <span className="text-ir-fg-4"> {s}</span>;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHead code="IR · 02 · Swap" title={TITLE} description={DESCRIPTION} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,520px)_320px] lg:justify-center xl:gap-8">
        {/* Ticket */}
        <div className="relative min-w-0">
          <div aria-hidden="true" className="glow pointer-events-none absolute -inset-x-16 -top-16 bottom-1/3 -z-10" />
          <section aria-label={`Swap ticket, ${market.symbol} / ${QUOTE_SYMBOL}`} className="card-lit p-4 sm:p-6">
            {/* Ticket head */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex min-w-0 items-center gap-3">
                <Monogram symbol={market.symbol} />
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-medium text-ir-fg">
                    {market.symbol} <span className="text-ir-fg-4">/ {QUOTE_SYMBOL}</span>
                  </h2>
                  <p className="truncate text-[12.5px] text-ir-fg-4">{market.name}</p>
                </div>
              </div>
              <Badge tone={sessionTone(session)}>
                {regime.label} x{regimeMul}
              </Badge>
            </div>

            {/* Market selector */}
            <div className="mt-5">
              <label htmlFor="swap-market" className="lbl mb-2 block px-1">
                Market
              </label>
              <Select id="swap-market" value={market.symbol} onChange={(e) => setSymbol(e.target.value)}>
                {markets.map((m) => (
                  <option key={m.symbol} value={m.symbol}>
                    {m.symbol} · {m.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Pay / flip / receive */}
            <div className="mt-4">
              <div className="rounded-[16px] border border-ir-line bg-white/[0.03] p-4 transition-colors focus-within:border-ir-ice/50 focus-within:bg-white/[0.045]">
                <label htmlFor="swap-pay" className="lbl block">
                  You pay<span className="sr-only">, {inSymbol}</span>
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="swap-pay"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amountRaw}
                    onChange={(e) => setAmountRaw(e.target.value)}
                    placeholder="0.00"
                    className="num min-w-0 flex-1 bg-transparent text-[32px] font-medium leading-none tracking-[-0.02em] text-ir-fg outline-none placeholder:text-ir-fg-4 sm:text-[36px]"
                  />
                  <TokenChip symbol={inSymbol} />
                </div>
              </div>

              <div className="relative z-10 -my-[18px] flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (quote.ok) setAmountRaw(quote.amountOut.toFixed(buyToken ? 4 : 2));
                    setBuyToken((v) => !v);
                  }}
                  aria-label="Reverse the swap direction"
                  className="group grid size-10 place-items-center rounded-[12px] border border-ir-line-strong bg-ir-raised text-ir-fg-2 shadow-[0_0_0_5px_#0d1724] transition-colors hover:border-ir-ice/50 hover:text-ir-ice"
                >
                  <ArrowDownUp className="size-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-[16px] border border-ir-line bg-white/[0.02] p-4">
                <label htmlFor="swap-receive" className="lbl block">
                  You receive<span className="sr-only">, {outSymbol}</span>
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="swap-receive"
                    readOnly
                    tabIndex={-1}
                    value={quote.ok ? fmtMoney(quote.amountOut, "", outDigits) : ""}
                    placeholder="0.00"
                    className="num min-w-0 flex-1 bg-transparent text-[32px] font-medium leading-none tracking-[-0.02em] text-ir-fg outline-none placeholder:text-ir-fg-4 sm:text-[36px]"
                  />
                  <TokenChip symbol={outSymbol} />
                </div>
              </div>
            </div>

            {/* Line-by-line breakdown */}
            <div className="mt-5 rounded-[16px] border border-ir-line px-4 py-2">
              <LeaderRow label="Chainlink mid" value={<>{fmtMoney(quote.mid)}{unit(QUOTE_SYMBOL)}</>} sub="per whole token, guarded" />
              <LeaderRow
                label={`Spread · ${fmtBps(quote.halfSpreadBps)}`}
                value={quote.ok ? <>{fmtMoney(quote.spreadAmount)}{unit(QUOTE_SYMBOL)}</> : "n/a"}
                sub={`tier ${tier.label} base ${fmtBps(tier.baseHalfSpreadBps)} x ${regime.label.toLowerCase()} ${regimeMul} · skew ${quote.skewBps >= 0 ? "+" : ""}${quote.skewBps} bps`}
              />
              <LeaderRow
                label={`Protocol fee · ${fmtBps(quote.feeBps)}`}
                value={quote.ok ? <>{fmtMoney(quote.feeAmount)}{unit(QUOTE_SYMBOL)}</> : "n/a"}
                sub="a separate line here and a separate field in the fill event"
              />
              <div className="my-1.5 rule" aria-hidden="true" />
              <LeaderRow
                label={<span className="text-ir-fg-2">Minimum received · {(slippageBps / 100).toFixed(2)}% bound</span>}
                value={
                  quote.ok ? (
                    <span className="font-medium">
                      {fmtMoney(minOut, "", outDigits)}
                      {unit(outSymbol)}
                    </span>
                  ) : (
                    "n/a"
                  )
                }
                sub="the swap reverts if you would get less"
              />
            </div>

            {/* Slippage bound */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <span className="lbl">Slippage bound</span>
              <Segmented
                label="Slippage bound"
                options={SLIPPAGE_SEGMENTS}
                value={String(slippageBps)}
                onChange={(v) => setSlippageBps(Number(v))}
                className="num"
              />
            </div>

            {!quote.ok && quote.reason && (
              <div className="mt-4">
                <Notice tone="warn">{quote.reason}</Notice>
              </div>
            )}
            {session === "closed" && (
              <div className="mt-4">
                <Notice tone="warn">
                  With US markets closed, this quote uses the x3 weekend spread and half the clip. Should the
                  trade be able to wait until the open, waiting will cost less, and the venue prefers to say so.
                </Notice>
              </div>
            )}

            <div className="mt-5">
              {authenticated ? (
                <Button className="btn-lg w-full" disabled>
                  Swap · opening market by market
                </Button>
              ) : (
                <Button className="btn-lg w-full" onClick={login}>
                  Sign in to trade
                </Button>
              )}
              <p className="mt-3 flex gap-2 px-1 text-[12.5px] leading-relaxed text-ir-fg-3">
                <Info className="mt-0.5 size-3.5 shrink-0 text-ir-fg-4" aria-hidden="true" />
                <span>
                  {authenticated
                    ? "While the launch is guarded, web submission is switched on market by market; in every case the ticket prices with the live formula."
                    : "Once verified, traders can be up and running in minutes."}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Side panels */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Sheet label="Market" meta={<Badge tone="muted">Tier {tier.label}</Badge>}>
            <div className="flex items-center gap-3">
              <Monogram symbol={market.symbol} />
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ir-fg">{market.symbol}</p>
                <p className="truncate text-[12.5px] text-ir-fg-4">{market.name}</p>
              </div>
            </div>
            <p className="num mt-5 text-[30px] font-medium leading-none tracking-[-0.02em] text-ir-fg">
              {fmtMoney(quote.mid)}
              <span className="text-[14px] font-normal text-ir-fg-4"> {QUOTE_SYMBOL}</span>
            </p>
            <p className="mt-2 text-[12.5px] text-ir-fg-3">Chainlink mid, guarded</p>
            <dl className="divide-hair mt-5 border-t border-ir-line text-[13px]">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-ir-fg-3">Session</dt>
                <dd>
                  <Badge tone={sessionTone(session)}>
                    {regime.label} x{regimeMul}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-ir-fg-3">Half-spread now</dt>
                <dd className="num text-ir-fg">{fmtBps(sessionHalfSpread)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2.5">
                <dt className="text-ir-fg-3">Clip this session</dt>
                <dd className="num text-ir-fg">
                  {fmtMoney(quote.clip, "", 0)}
                  {unit(QUOTE_SYMBOL)}
                </dd>
              </div>
            </dl>
          </Sheet>

          <Sheet label="Route">
            <dl className="divide-hair -my-1 text-[13px]">
              {[
                ["Route", buyToken ? `${QUOTE_SYMBOL} → ${market.symbol}` : `${market.symbol} → ${QUOTE_SYMBOL}`],
                ["Venue", "vault, RFQ if better"],
                ["Oracle band", fmtBps(tier.oracleBandBps, 0)],
                ["Swap fee", fmtBps(FEES.swapFeeBps)],
                ["RFQ fee", fmtBps(FEES.rfqFeeBps)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-ir-fg-3">{k}</dt>
                  <dd className="num text-right text-ir-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-ir-line pt-4 text-[12.5px] text-ir-fg-3">Atomic settlement · no custody</p>
          </Sheet>

          <div className="rounded-[14px] border border-ir-line px-4 py-3.5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ir-fg-2">
              <Info className="size-3.5 text-ir-ice" aria-hidden="true" />
              How this price is built
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ir-fg-3">
              The guarded Chainlink mid, plus the tier&apos;s half-spread scaled for the session, nudged by inventory
              skew, plus a separate protocol fee. If the total would fall outside the oracle band, no quote is given.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
