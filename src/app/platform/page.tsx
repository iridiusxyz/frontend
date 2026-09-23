"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, BarChart3, Gauge, Inbox, Vault } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  BarChart,
  BarList,
  EmptyState,
  ExplorerLink,
  LeaderRow,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
  sessionTone,
} from "@/components/platform/ui";
import { fmtAgo, fmtBps, fmtCompact, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession, quoteSwap, type Session } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

/** A lit dot whose colour follows the session: up when open, warn when extended, faint when closed, down when halted. */
function SessionDot({ session }: { session: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pulse-dot inline-block size-1.5 rounded-full",
        session === "regular" && "bg-ir-up shadow-[0_0_10px_1px_rgb(95_208_165/0.6)]",
        session === "extended" && "bg-ir-warn shadow-[0_0_10px_1px_rgb(233_189_114/0.5)]",
        session === "closed" && "bg-ir-ice shadow-[0_0_10px_1px_rgb(142_182_232/0.5)]",
        session !== "regular" && session !== "extended" && session !== "closed" && "bg-ir-down"
      )}
    />
  );
}

/** The market's logo tile. */
function Monogram({ symbol }: { symbol: string }) {
  return <TokenLogo symbol={symbol} size={32} />;
}

const SESSION_NOTE: Record<Session, string> = {
  regular: "US equities are trading, so tier base spreads and full clips apply.",
  extended: "Pre or post market: spreads widen and clips shrink while the underlying trades thinly.",
  closed: "US markets are shut: spreads widen to price gap risk and clips are cut back.",
};

type TierFilter = "all" | "1" | "2" | "3";
const TIER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "Tier A" },
  { value: "2", label: "Tier B" },
  { value: "3", label: "Tier C" },
] as const satisfies readonly { value: TierFilter; label: string }[];

const fmtQuote = (v: number) => fmtMoney(v, QUOTE_SYMBOL);

export default function OverviewPage() {
  const { authenticated, login } = useSession();
  const router = useRouter();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const regime = REGIMES[session];
  const [tier, setTier] = useState<TierFilter>("all");

  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const fills = useMemo(() => venue.data?.fills ?? [], [venue.data]);
  const loading = venue.loading && !venue.data;

  const tvl = markets.reduce((acc, m) => acc + m.tvl, 0);
  const volume = markets.reduce((acc, m) => acc + m.volume24h, 0);
  const funded = markets.filter((m) => m.tvl > 0).length;

  const dayFills = useMemo(() => fills.filter((f) => f.minutesAgo < 1440), [fills]);
  const avgExecution = dayFills.length ? dayFills.reduce((s, f) => s + f.executionBps, 0) / dayFills.length : null;

  // 24 hourly buckets from fills, oldest on the left.
  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const h = 23 - i;
      return { label: h === 0 ? "Within the last hour" : `${h}h ago`, value: 0 };
    });
    for (const f of dayFills) buckets[23 - Math.floor(f.minutesAgo / 60)].value += f.notional;
    return buckets;
  }, [dayFills]);
  const fillVolume = dayFills.reduce((s, f) => s + f.notional, 0);

  const shown = tier === "all" ? markets : markets.filter((m) => String(m.tier) === tier);
  const tvlRank = [...markets].filter((m) => m.tvl > 0).sort((a, b) => b.tvl - a.tvl);
  const latest = [...fills].sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, 5);

  return (
    <div>
      <PageHead
        code="IR · 01 · Overview"
        title="The venue, as it stands"
        description="Each market quotes around the guarded Chainlink mid, with session, spread and fee all visible."
        action={
          !authenticated ? (
            <button type="button" onClick={login} className="btn btn-primary">
              Sign in to trade
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <Link href="/platform/swap" className="btn btn-primary">
              New swap
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )
        }
      />

      <StatBand className="mt-6">
        <StatCard
          label="Vault TVL"
          value={fmtCompact(tvl, QUOTE_SYMBOL)}
          hint={`${funded} of ${markets.length} markets funded`}
          icon={<Vault />}
        />
        <StatCard
          label="24h volume"
          value={fmtCompact(volume, QUOTE_SYMBOL)}
          hint="vault and RFQ together"
          accent="black"
          icon={<BarChart3 />}
        />
        <StatCard
          label="Fills"
          value={String(dayFills.length)}
          hint={`last 24h, ${fmtCompact(fillVolume, QUOTE_SYMBOL)} notional`}
          icon={<Activity />}
        />
        <StatCard
          label="Avg. execution"
          value={avgExecution === null ? "n/a" : fmtBps(avgExecution)}
          hint="mean over mid paid, incl. fee"
          icon={<Gauge />}
        />
      </StatBand>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Sheet label="Volume by hour" meta={<span>last 24h, from fills</span>}>
          {loading ? (
            <Skeleton rows={4} />
          ) : (
            <BarChart
              data={hourly}
              height={168}
              format={fmtQuote}
              axisLabels={["24h ago", "12h ago", "Now"]}
              emptyLabel="No fills in the last 24 hours"
            />
          )}
        </Sheet>
        <Sheet label="Session" meta={<SessionDot session={session} />}>
          <div className="flex items-center gap-3">
            <Badge tone={sessionTone(session)}>{regime.label}</Badge>
            <span className="text-[12.5px] text-ir-fg-4">US equity clock</span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ir-fg-2">{SESSION_NOTE[session]}</p>
          <div className="mt-3">
            <LeaderRow label="Spread multiplier" value={`x${(regime.spreadMulBps / 10_000).toFixed(1)}`} />
            <LeaderRow label="Clip multiplier" value={`x${(regime.clipMulBps / 10_000).toFixed(2)}`} />
            <LeaderRow
              label="Protocol fee"
              value={fmtBps(FEES.swapFeeBps, 0)}
              sub={`plus ${FEES.spreadShareBps / 100}% of realised spread`}
            />
          </div>
        </Sheet>
      </div>

      <div className="mt-6">
        <Sheet
          label="Markets"
          meta={
            <span className="hidden sm:inline">
              {venue.data?.source === "supabase" ? "Indexer read model" : "Indicative catalogue"}
            </span>
          }
        >
          <div className="-mx-5 -mt-5 mb-0 flex flex-wrap items-center justify-between gap-3 border-b border-ir-line px-5 py-3">
            <Segmented label="Filter markets by tier" options={TIER_OPTIONS} value={tier} onChange={setTier} />
            <span className="text-[12.5px] text-ir-fg-4">
              {shown.length} {shown.length === 1 ? "market" : "markets"}
            </span>
          </div>
          {loading ? (
            <div className="pt-5">
              <Skeleton rows={6} />
            </div>
          ) : shown.length === 0 ? (
            <div className="pt-5">
              <EmptyState icon={<Inbox />} title="No markets in this tier" body="Pick another tier to see its vaults." />
            </div>
          ) : (
            <Table minWidth={760}>
              <thead>
                <tr>
                  <Th>Market</Th>
                  <Th>Tier</Th>
                  <Th className="text-right">Mid, {QUOTE_SYMBOL}</Th>
                  <Th className="text-right">Buy half-spread, bps</Th>
                  <Th className="text-right">Clip now, {QUOTE_SYMBOL}</Th>
                  <Th className="text-right">24h volume, {QUOTE_SYMBOL}</Th>
                  <Th className="text-right">TVL, {QUOTE_SYMBOL}</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => {
                  const q = quoteSwap(m, true, 1_000, session);
                  const href = `/platform/swap?market=${encodeURIComponent(m.symbol)}`;
                  return (
                    <tr key={m.symbol} className="cursor-pointer" onClick={() => router.push(href)}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Monogram symbol={m.symbol} />
                          <div className="min-w-0">
                            <Link
                              href={href}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-ir-fg hover:text-ir-ice-bright"
                              aria-label={`Swap ${m.symbol}`}
                            >
                              {m.symbol}
                            </Link>
                            <div className="truncate text-[12.5px] text-ir-fg-4">{m.name}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge tone={m.tier === 1 ? "ice" : "muted"}>{TIERS[m.tier].label}</Badge>
                      </Td>
                      <Td className="text-right text-ir-fg">{fmtMoney(m.mid)}</Td>
                      <Td className="text-right text-ir-ice">{q.halfSpreadBps.toFixed(1)}</Td>
                      <Td className="text-right">{fmtCompact(q.clip)}</Td>
                      <Td className="text-right">{m.volume24h > 0 ? fmtMoney(m.volume24h) : <span className="text-ir-fg-4">0</span>}</Td>
                      <Td className="text-right text-ir-fg">{m.tvl > 0 ? fmtMoney(m.tvl) : <span className="text-ir-fg-4">0</span>}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <p className="mt-5 text-[12px] leading-relaxed text-ir-fg-3">
            The half-spread displayed is for a buy at this moment: tier base x session multiplier, then adjusted for inventory skew.
          </p>
        </Sheet>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Sheet label="TVL by market" meta={<span className="num">{fmtCompact(tvl, QUOTE_SYMBOL)}</span>}>
          {loading ? (
            <Skeleton rows={5} />
          ) : tvlRank.length === 0 ? (
            <EmptyState icon={<Vault />} title="No funded vaults yet" />
          ) : (
            <BarList
              items={tvlRank.map((m) => ({
                key: m.symbol,
                label: m.symbol,
                value: m.tvl,
                display: (
                  <>
                    {fmtMoney(m.tvl, "", 0)}
                    <span className="text-ir-fg-4"> {QUOTE_SYMBOL}</span>
                  </>
                ),
              }))}
            />
          )}
        </Sheet>
        <Sheet label="Latest fills" meta={<ExplorerLink href="/platform/explorer">View all</ExplorerLink>}>
          {loading ? (
            <Skeleton rows={5} />
          ) : latest.length === 0 ? (
            <EmptyState icon={<Activity />} title="No fills yet" body="Fills appear here as soon as the vaults trade." />
          ) : (
            <ul className="-my-2 divide-y divide-ir-line">
              {latest.map((f, i) => (
                <li key={`${f.symbol}-${f.minutesAgo}-${i}`} className="flex items-center gap-3 py-2.5">
                  <Badge tone={f.side === "buy" ? "up" : "down"}>{f.side === "buy" ? "Buy" : "Sell"}</Badge>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ir-fg">
                    {f.symbol}
                    {f.venue === "rfq" && <span className="ml-2 text-[12px] font-normal text-ir-fg-4">RFQ</span>}
                  </span>
                  <span className="num shrink-0 text-[13.5px] text-ir-fg-2">
                    {fmtMoney(f.notional)}
                    <span className="text-ir-fg-4"> {QUOTE_SYMBOL}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-[12px] text-ir-fg-4">{fmtAgo(f.minutesAgo)}</span>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      </div>
    </div>
  );
}
