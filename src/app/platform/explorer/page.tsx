"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Gauge, Layers, ReceiptText, SearchX } from "lucide-react";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  BarChart,
  Badge,
  EmptyState,
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
import { fmtAgo, fmtBps, fmtCompact } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";

type SideFilter = "all" | "buy" | "sell";
type VenueFilter = "all" | "vault" | "rfq";

const SIDE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
] as const;

const VENUE_OPTIONS = [
  { value: "all", label: "All venues" },
  { value: "vault", label: "Vault" },
  { value: "rfq", label: "RFQ" },
] as const;

const fmtMul = (bps: number) => `x${(bps / 10_000).toFixed(1)}`;

export default function ExplorerPage() {
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));

  const [side, setSide] = useState<SideFilter>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");

  const fills = useMemo(() => venue.data?.fills ?? [], [venue.data]);
  const governance = venue.data?.governance ?? [];
  const markets = venue.data?.markets ?? [];
  const marketCount = markets.length;
  const nameOf = (symbol: string) => markets.find((m) => m.symbol === symbol)?.name;

  const stats = useMemo(() => {
    const total = fills.reduce((s, f) => s + f.notional, 0);
    const weighted = fills.reduce((s, f) => s + f.executionBps * f.notional, 0);
    const rfq = fills.filter((f) => f.venue === "rfq").reduce((s, f) => s + f.notional, 0);
    return {
      total,
      avgBps: total > 0 ? weighted / total : null,
      rfqShare: total > 0 ? (rfq / total) * 100 : 0,
      rfqCount: fills.filter((f) => f.venue === "rfq").length,
    };
  }, [fills]);

  const chronological = useMemo(() => [...fills].sort((a, b) => b.minutesAgo - a.minutesAgo), [fills]);
  const chartData = chronological.map((f) => ({ label: `${f.symbol} · ${fmtAgo(f.minutesAgo)}`, value: f.executionBps }));

  const shown = fills.filter((f) => (side === "all" || f.side === side) && (venueFilter === "all" || f.venue === venueFilter));

  const loading = venue.loading && !venue.data;

  return (
    <div>
      <PageHead
        code="IR · 05 · Explorer"
        title="Each number cites its source"
        description="Itemised fill breakdowns, the parameters currently in force, and the governance log. All of it is derived purely from chain events, and where they disagree the chain is right."
      />

      <StatBand className="mt-6">
        <StatCard
          label="Fills shown"
          value={loading ? "…" : String(fills.length)}
          hint={venue.data?.source === "supabase" ? "From the indexer read model" : "Indicative until the indexer lands"}
          icon={<ReceiptText aria-hidden="true" />}
        />
        <StatCard
          label="Total notional"
          value={loading ? "…" : fmtCompact(stats.total, QUOTE_SYMBOL)}
          hint="Across every fill listed"
          icon={<Layers aria-hidden="true" />}
        />
        <StatCard
          label="Average paid over mid"
          value={loading ? "…" : fmtBps(stats.avgBps)}
          hint="Weighted by notional"
          accent="black"
          icon={<Gauge aria-hidden="true" />}
        />
        <StatCard
          label="Routed via RFQ"
          value={loading ? "…" : `${stats.rfqShare.toFixed(0)}%`}
          hint={`${stats.rfqCount} of ${fills.length} fills, by notional`}
          icon={<ArrowLeftRight aria-hidden="true" />}
        />
      </StatBand>

      <Sheet label="Execution vs mid" meta="bps over mid, per fill" className="mt-6">
        {loading ? (
          <Skeleton rows={4} />
        ) : (
          <BarChart
            data={chartData}
            height={150}
            format={(v) => fmtBps(v)}
            emptyLabel="No fills yet"
            axisLabels={
              chronological.length > 0
                ? [
                    `Oldest, ${fmtAgo(chronological[0].minutesAgo)}`,
                    `${chronological.length} fills`,
                    `Latest, ${fmtAgo(chronological[chronological.length - 1].minutesAgo)}`,
                  ]
                : undefined
            }
          />
        )}
      </Sheet>

      <Sheet
        label="Fills"
        meta={venue.data?.source === "supabase" ? "indexer read model" : "indicative until the indexer lands"}
        className="mt-6"
      >
        {loading ? (
          <Skeleton rows={8} />
        ) : fills.length === 0 ? (
          <EmptyState
            icon={<ReceiptText aria-hidden="true" />}
            title="No fills yet."
            action={
              <Link href="/platform/swap" className="btn btn-secondary btn-sm">
                Open the ticket
              </Link>
            }
          />
        ) : (
          <>
            <div className="-mx-5 -mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-ir-line px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented label="Filter by side" options={SIDE_OPTIONS} value={side} onChange={setSide} />
                <Segmented label="Filter by venue" options={VENUE_OPTIONS} value={venueFilter} onChange={setVenueFilter} />
              </div>
              <span className="text-[12.5px] text-ir-fg-3">
                <span className="num text-ir-fg-2">{shown.length}</span> of <span className="num">{fills.length}</span>
              </span>
            </div>
            {shown.length === 0 ? (
              <div className="pt-5">
                <EmptyState
                  icon={<SearchX aria-hidden="true" />}
                  title="No fills match these filters"
                  action={
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSide("all");
                        setVenueFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  }
                />
              </div>
            ) : (
              <Table minWidth={720}>
                <thead>
                  <tr>
                    <Th>Time</Th>
                    <Th>Market</Th>
                    <Th>Side</Th>
                    <Th className="text-right">Notional</Th>
                    <Th>Venue</Th>
                    <Th className="text-right">Paid over mid</Th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((f, i) => {
                    const name = nameOf(f.symbol);
                    return (
                      <tr key={`${f.minutesAgo}-${f.symbol}-${i}`}>
                        <Td className="whitespace-nowrap font-mono text-[12.5px] text-ir-fg-3">{fmtAgo(f.minutesAgo)}</Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <TokenLogo symbol={f.symbol} size={32} />
                            <div className="min-w-0 leading-tight">
                              <div className="font-medium text-ir-fg">{f.symbol}</div>
                              {name && <div className="truncate text-[12.5px] text-ir-fg-4">{name}</div>}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <Badge tone={f.side === "buy" ? "up" : "down"}>{f.side === "buy" ? "Buy" : "Sell"}</Badge>
                        </Td>
                        <Td className="whitespace-nowrap text-right text-ir-fg">
                          {fmtCompact(f.notional)}
                          <span className="text-ir-fg-4"> {QUOTE_SYMBOL}</span>
                        </Td>
                        <Td>
                          <span className="tag">{f.venue === "rfq" ? "RFQ" : "Vault"}</span>
                        </Td>
                        <Td className="whitespace-nowrap text-right text-ir-fg">
                          {f.executionBps.toFixed(1)}
                          <span className="text-ir-fg-4"> bps</span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-ir-fg-3">
          Every fill is listed, costly closed-session fills included; the filters above only narrow the view.
        </p>
      </Sheet>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
        <Sheet label="Parameters in force now" meta="timelocked, rationale published">
          <ParamGroup title="Tiers">
            {([1, 2, 3] as const).map((t) => (
              <LeaderRow
                key={t}
                label={
                  <span className="inline-flex items-center gap-2.5">
                    <Badge tone={t === 1 ? "ice" : "muted"}>Tier {TIERS[t].label}</Badge>
                    <span>
                      half-spread <span className="num text-ir-fg-2">{fmtBps(TIERS[t].baseHalfSpreadBps)}</span>
                    </span>
                  </span>
                }
                value={
                  <>
                    band {fmtBps(TIERS[t].oracleBandBps, 0)}
                    <span className="text-ir-fg-4"> · </span>
                    clip {fmtCompact(TIERS[t].maxClip, QUOTE_SYMBOL)}
                  </>
                }
              />
            ))}
          </ParamGroup>
          <ParamGroup title="Session">
            <LeaderRow label="Session now" value={<Badge tone={sessionTone(session)}>{REGIMES[session].label}</Badge>} />
          </ParamGroup>
          <ParamGroup title="Regime multipliers">
            <LeaderRow label="Extended" value={`${fmtMul(REGIMES.extended.spreadMulBps)} spread`} />
            <LeaderRow label="Closed" value={`${fmtMul(REGIMES.closed.spreadMulBps)} spread`} />
          </ParamGroup>
          <ParamGroup title="Fees">
            <LeaderRow label="Swap" value={fmtBps(FEES.swapFeeBps)} />
            <LeaderRow label="RFQ" value={fmtBps(FEES.rfqFeeBps)} />
            <LeaderRow label="Share of spread" value={`${FEES.spreadShareBps / 100}%`} />
          </ParamGroup>
          <ParamGroup title="Markets">
            <LeaderRow label="Markets live" value={String(marketCount)} />
          </ParamGroup>
        </Sheet>

        <Sheet label="Governance log" meta="no fund access, ever">
          <p className="mb-5 text-[13px] text-ir-fg-3">Every change, before it bites.</p>
          <ol className="relative space-y-5">
            {governance.map((entry, i) => (
              <li key={entry.date + entry.action} className="relative pl-6">
                {i < governance.length - 1 && (
                  <span aria-hidden="true" className="absolute bottom-[-20px] left-[3px] top-4 w-px bg-ir-line-strong" />
                )}
                <span
                  aria-hidden="true"
                  className={
                    i === 0
                      ? "absolute left-0 top-[7px] size-[7px] rounded-full bg-ir-ice shadow-[0_0_10px_rgb(142_182_232/0.7)]"
                      : "absolute left-0 top-[7px] size-[7px] rounded-full border border-ir-ice-deep bg-ir-void"
                  }
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[14px] font-medium text-ir-fg">{entry.action}</span>
                  <time dateTime={entry.date} className="font-mono text-[11.5px] text-ir-fg-3">
                    {entry.date}
                  </time>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ir-fg-2">{entry.detail}</p>
              </li>
            ))}
          </ol>
        </Sheet>
      </div>
    </div>
  );
}

function ParamGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ir-line pt-3 mt-3 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="lbl mb-1">{title}</h3>
      {children}
    </div>
  );
}
