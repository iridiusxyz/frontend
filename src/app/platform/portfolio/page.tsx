"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, BadgeCheck, Layers, Percent, ReceiptText, Wallet } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { RequireAuth } from "@/components/platform/PlatformShell";
import { useAsync, useNow } from "@/components/platform/usePlatformData";
import {
  Badge,
  EmptyState,
  Notice,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/platform/ui";
import { getMyAttestations, getWalletFills } from "@/lib/platform/queries";
import { fmtAgo, fmtBps, fmtCompact, fmtDate, shortAddress } from "@/lib/platform/format";
import { QUOTE_SYMBOL, marketBySymbol } from "@/lib/platform/markets";
import { platformEnv } from "@/lib/platform/env";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

export default function PortfolioPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHead
        code="IR · 04 · Portfolio"
        title="Your holdings, read from the chain"
        description={`Your balances, LP positions and fill history come from ${platformEnv.chainName}, priced with the guarded oracles the vaults themselves quote from. None of it is drawn from a private ledger.`}
      />
      <RequireAuth title="Sign in to view your portfolio">
        <Portfolio />
      </RequireAuth>
    </div>
  );
}

const ROLES = ["TRADER", "LP", "MAKER", "RELAYER"] as const;

type SideFilter = "all" | "buy" | "sell";
const SIDE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "buy", label: "Buys" },
  { value: "sell", label: "Sells" },
] as const satisfies readonly { value: SideFilter; label: string }[];

function SwapCta({ label = "Make your first swap" }: { label?: string }) {
  return (
    <Link href="/platform/swap" className="btn btn-primary btn-sm">
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function Portfolio() {
  const { api, db, userId, walletAddress } = useSession();
  const fills = useAsync(
    () => (walletAddress ? getWalletFills(db, walletAddress) : Promise.resolve([])),
    [db, walletAddress]
  );
  const attestations = useAsync(() => getMyAttestations(api), [api, userId]);
  const now = useNow();
  const [side, setSide] = useState<SideFilter>("all");

  const fillRows = useMemo(() => fills.data ?? [], [fills.data]);
  const shown = useMemo(() => (side === "all" ? fillRows : fillRows.filter((f) => f.side === side)), [fillRows, side]);

  const activeRoles = ROLES.map((role) => ({
    role,
    attestation: attestations.data?.find(
      (x) => x.role === role && x.status === "active" && new Date(x.expires_at) > new Date()
    ),
  }));
  const activeCount = activeRoles.filter((r) => r.attestation).length;

  const fillsReady = !(fills.loading && !fills.data);
  const attestationsReady = !(attestations.loading && !attestations.data);
  const totalNotional = fillRows.reduce((s, f) => s + (Number(f.notional) || 0), 0);
  const avgOverMid =
    fillRows.length > 0
      ? fillRows.reduce((s, f) => s + f.half_spread_bps + f.fee_bps, 0) / fillRows.length
      : null;

  return (
    <div className="space-y-6">
      <Notice>
        You are connected as <span className="font-mono">{shortAddress(walletAddress)}</span>. While the launch is
        guarded, balance indexing is still being hooked up to the venue indexer, so for now the chain itself is your
        record of truth. The trade history and attestations shown below come from the venue&apos;s public read model.
      </Notice>

      {/* KPIs: only figures the read model actually returns. Holdings value and LP positions wait for the indexer. */}
      {fillsReady && attestationsReady ? (
        <StatBand>
          <StatCard
            label="Fills"
            value={String(fillRows.length)}
            hint={fillRows.length === 50 ? "latest 50, this wallet" : "this wallet"}
            icon={<ReceiptText />}
          />
          <StatCard
            label="Notional traded"
            value={fmtCompact(totalNotional)}
            hint={`${QUOTE_SYMBOL}, across listed fills`}
            icon={<ArrowLeftRight />}
          />
          <StatCard
            label="Avg paid over mid"
            value={avgOverMid === null ? "n/a" : fmtBps(avgOverMid)}
            hint="half-spread plus fee"
            icon={<Percent />}
          />
          <StatCard
            label="Attestations active"
            value={`${activeCount} of ${ROLES.length}`}
            hint={activeCount > 0 ? activeRoles.filter((r) => r.attestation).map((r) => r.role).join(" · ") : "none issued yet"}
            accent={activeCount > 0 ? "black" : undefined}
            icon={<BadgeCheck />}
          />
        </StatBand>
      ) : (
        <div className="panel p-5">
          <Skeleton rows={2} />
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Sheet label="Holdings" meta="token and share terms">
          <EmptyState
            icon={<Wallet />}
            title="Nothing indexed yet"
            body="As soon as the indexer is connected, this wallet's balances will show up here on their own. Either way, any swap you settle is on-chain straight away."
            action={<SwapCta />}
          />
        </Sheet>

        <Sheet label="LP positions" meta="value per share, accrued spread">
          <EmptyState
            icon={<Layers />}
            title="No vault shares found"
            body="Start earning the spread by funding a vault on the Liquidity page. Shares can only move between attested LPs, and you can always withdraw."
            action={
              <Link href="/platform/liquidity" className="btn btn-secondary btn-sm">
                Browse vaults
              </Link>
            }
          />
        </Sheet>
      </div>

      <Sheet
        label="Trade history"
        meta={
          fillRows.length > 0 ? (
            <Segmented label="Filter fills by side" options={SIDE_OPTIONS} value={side} onChange={setSide} />
          ) : (
            "from the venue read model"
          )
        }
      >
        {!fillsReady ? (
          <Skeleton rows={5} />
        ) : fillRows.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="This wallet has no fills yet"
            body="Each swap you settle will be listed here with its complete breakdown of mid, spread, skew and fee, just as the fill event logs it."
            action={<SwapCta />}
          />
        ) : (
          <>
            <Table minWidth={720}>
              <thead>
                <tr>
                  <Th>Market</Th>
                  <Th>Side</Th>
                  <Th className="text-right">Notional ({QUOTE_SYMBOL})</Th>
                  <Th>Venue</Th>
                  <Th className="text-right">Paid over mid</Th>
                  <Th className="text-right">When</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f) => {
                  const sym = f.markets?.symbol ?? "?";
                  const name = marketBySymbol[sym]?.name;
                  return (
                    <tr key={f.id}>
                      <Td>
                        <span className="flex items-center gap-3">
                          <TokenLogo symbol={sym} size={32} />
                          <span className="min-w-0">
                            <span className="block font-medium text-ir-fg">{sym}</span>
                            {name && <span className="block truncate text-[12.5px] text-ir-fg-4">{name}</span>}
                          </span>
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={f.side === "buy" ? "up" : "down"}>{f.side === "buy" ? "Buy" : "Sell"}</Badge>
                      </Td>
                      <Td className="text-right text-ir-fg">
                        {fmtCompact(f.notional)}
                        <span className="text-ir-fg-4"> {QUOTE_SYMBOL}</span>
                      </Td>
                      <Td>
                        <Badge tone={f.venue === "vault" ? "muted" : "ice"}>{f.venue === "vault" ? "Vault" : "RFQ"}</Badge>
                      </Td>
                      <Td className="text-right text-ir-fg-2">{fmtBps(f.half_spread_bps + f.fee_bps)}</Td>
                      <Td className="whitespace-nowrap text-right font-mono text-[12.5px] text-ir-fg-3">
                        <time dateTime={f.executed_at} title={fmtDate(f.executed_at)}>
                          {fmtAgo(Math.max(0, (now - new Date(f.executed_at).getTime()) / 60_000))}
                        </time>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {shown.length === 0 && (
              <p className="py-6 text-center text-[13.5px] text-ir-fg-3">
                No {side === "buy" ? "buys" : "sells"} from this wallet yet.
              </p>
            )}
            <p className="mt-4 text-[12.5px] leading-relaxed text-ir-fg-3">
              Each fill, itemised exactly as it appears on the public explorer.
            </p>
          </>
        )}
      </Sheet>

      <Sheet label="Role attestations" meta={attestationsReady ? `${activeCount} of ${ROLES.length} active` : undefined}>
        {!attestationsReady ? (
          <Skeleton rows={4} />
        ) : (
          <ul className="-mx-5 -mt-5 divide-y divide-ir-line border-b border-ir-line">
            {activeRoles.map(({ role, attestation: a }) => (
              <li key={role} className="flex min-h-[52px] items-center justify-between gap-4 px-5 py-2.5">
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn("size-1.5 shrink-0 rounded-full", a ? "bg-ir-up shadow-[0_0_8px_rgb(95_208_165/0.6)]" : "bg-ir-fg-4")}
                  />
                  <span className="font-mono text-[12.5px] text-ir-fg">{role}</span>
                </span>
                <span className="flex items-center gap-3">
                  {a && (
                    <span className="font-mono text-[12px] text-ir-fg-4">
                      expires {fmtDate(a.expires_at)}
                    </span>
                  )}
                  <Badge tone={a ? "up" : "muted"}>{a ? "Active" : "Not issued"}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-ir-fg-3">
            You need a role attestation to trade, to provide liquidity or to make markets, and you can manage them in
            Settings. Withdrawing from a vault never needs one.
          </p>
          <Link href="/platform/settings" className="btn btn-secondary btn-sm shrink-0">
            Open Settings
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Sheet>
    </div>
  );
}
