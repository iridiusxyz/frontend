"use client";

import { useMemo, useState } from "react";
import { Crosshair, Inbox, Layers, Percent, ShieldCheck, TrendingUp, TriangleAlert, Vault } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  EmptyState,
  Meter,
  Notice,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  SplitBar,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
  sessionTone,
} from "@/components/platform/ui";
import { fmtCompact, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

type TierFilter = "all" | "1" | "2" | "3";
const TIER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "Tier A" },
  { value: "2", label: "Tier B" },
  { value: "3", label: "Tier C" },
] as const satisfies readonly { value: TierFilter; label: string }[];

const LP_SHARE = 100 - FEES.spreadShareBps / 100;

const EXPLAINERS = [
  {
    label: "What you earn",
    icon: TrendingUp,
    tone: "text-ir-up",
    body: `You earn the realised spread on each fill your vault makes, less the protocol's ${FEES.spreadShareBps / 100}% cut, accruing continuously into value per share. There are no emissions and no points.`,
  },
  {
    label: "What you risk",
    icon: TriangleAlert,
    tone: "text-ir-warn",
    body: "Exposure to the price of your chosen token, weekend gap risk on fills in closed sessions (priced in via the x3 multiplier), and the issuer risk carried by every Stock Token.",
  },
  {
    label: "What you never risk",
    icon: ShieldCheck,
    tone: "text-ir-ice",
    body: "Leverage, liquidation, losses socialised from other markets, or any gate on leaving. Withdrawing is guaranteed by an invariant rather than granted as a permission.",
  },
];

export default function LiquidityPage() {
  const { authenticated, login } = useSession();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const loading = venue.loading && !venue.data;
  const [tier, setTier] = useState<TierFilter>("all");

  const tvl = markets.reduce((acc, m) => acc + m.tvl, 0);
  const funded = markets.filter((m) => m.tvl > 0);
  const inBand = markets.filter((m) => Math.abs(m.inventoryRatioBps - 5000) <= TIERS[m.tier].inventoryBandBps).length;
  const shown = tier === "all" ? markets : markets.filter((m) => String(m.tier) === tier);
  const share = [...funded].sort((a, b) => b.tvl - a.tvl).map((m) => ({ key: m.symbol, label: m.symbol, value: m.tvl }));

  return (
    <div>
      <PageHead
        code="IR · 03 · Liquidity"
        title="Collect the spread, not the cost of arbitrage"
        description="Vaults quote around the oracle, so LP income reflects what the market pays for immediacy. Every vault stands alone: losses in other markets cannot touch you."
      />

      <div className="mt-6">
        <Notice>
          To provide liquidity you need an <span className="font-mono">LP</span> attestation, which is issued to
          professional clients while the launch is guarded. Withdrawals are pro-rata and in kind, and they always
          work, whatever state the vault is in.
        </Notice>
      </div>

      <StatBand className="mt-6">
        <StatCard label="Total TVL" value={fmtCompact(tvl, QUOTE_SYMBOL)} hint="across all vaults" accent="black" icon={<Vault />} />
        <StatCard
          label="Vaults"
          value={String(markets.length)}
          hint={`${funded.length} funded, ${markets.length - funded.length} awaiting deposits`}
          icon={<Layers />}
        />
        <StatCard
          label="LP share of spread"
          value={`${LP_SHARE}%`}
          hint={`protocol keeps ${FEES.spreadShareBps / 100}%`}
          icon={<Percent />}
        />
        <StatCard
          label="Within inventory band"
          value={`${inBand} of ${markets.length}`}
          hint="token share inside 30% to 70%"
          icon={<Crosshair />}
        />
      </StatBand>

      <Sheet
        className="mt-6"
        label="Vaults"
        meta={
          <span className="flex items-center gap-2">
            Session <Badge tone={sessionTone(session)}>{REGIMES[session].label}</Badge>
          </span>
        }
      >
        <div className="-mx-5 -mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-ir-line px-5 py-3">
          <Segmented label="Filter vaults by tier" options={TIER_OPTIONS} value={tier} onChange={setTier} />
          <span className="text-[12.5px] text-ir-fg-4">
            {shown.length} {shown.length === 1 ? "vault" : "vaults"}
          </span>
        </div>
        {loading ? (
          <div className="pt-5">
            <Skeleton rows={6} />
          </div>
        ) : shown.length === 0 ? (
          <div className="pt-5">
            <EmptyState icon={<Inbox />} title="No vaults in this tier" body="Pick another tier to see its vaults." />
          </div>
        ) : (
          <Table minWidth={820}>
            <thead>
              <tr>
                <Th>Vault</Th>
                <Th>Tier</Th>
                <Th className="text-right">TVL, {QUOTE_SYMBOL}</Th>
                <Th>Inventory, token share</Th>
                <Th className="text-right">Base half-spread, bps</Th>
                <Th className="text-right">LP share</Th>
                <Th className="text-right">
                  <span className="sr-only">Action</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                const t = TIERS[m.tier];
                const pct = m.inventoryRatioBps / 100;
                // Warn as the vault nears the edge of its inventory band.
                const warn = Math.abs(m.inventoryRatioBps - 5000) > t.inventoryBandBps * 0.75;
                return (
                  <tr key={m.symbol}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <TokenLogo symbol={m.symbol} size={32} />
                        <div className="min-w-0">
                          <div className="font-medium text-ir-fg">{m.symbol}</div>
                          <div className="truncate text-[12.5px] text-ir-fg-4">{m.name}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={m.tier === 1 ? "ice" : "muted"}>{t.label}</Badge>
                    </Td>
                    <Td className="text-right text-ir-fg">{m.tvl > 0 ? fmtMoney(m.tvl) : <span className="text-ir-fg-4">0</span>}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Meter value={pct / 100} target={0.5} tone={warn ? "warn" : "ice"} className="w-28" />
                        <span className={cn("text-[12.5px]", warn ? "text-ir-warn" : "text-ir-fg-2")}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </Td>
                    <Td className="text-right">{t.baseHalfSpreadBps}</Td>
                    <Td className="text-right text-ir-up">{LP_SHARE}%</Td>
                    <Td className="text-right">
                      {authenticated ? (
                        <button type="button" className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-40" disabled>
                          Deposit soon
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={login}>
                          Sign in
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-ir-fg-3">
          Deposits are valued at the live mid and therefore pause during a market halt; withdrawals never pause. The
          marker on each meter is the 50% target.
        </p>
      </Sheet>

      <Sheet className="mt-6" label="TVL share by vault" meta={<span className="num">{fmtCompact(tvl, QUOTE_SYMBOL)}</span>}>
        {loading ? (
          <Skeleton rows={2} />
        ) : share.length === 0 ? (
          <EmptyState icon={<Vault />} title="No funded vaults yet" />
        ) : (
          <SplitBar parts={share} format={(v) => fmtMoney(v)} />
        )}
      </Sheet>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
        {EXPLAINERS.map((c) => (
          <div key={c.label} className="panel p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-ir-line bg-ir-raised">
                <c.icon className={cn("size-4", c.tone)} aria-hidden="true" />
              </span>
              <h3 className="text-[14px] font-medium text-ir-fg">{c.label}</h3>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ir-fg-2">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
