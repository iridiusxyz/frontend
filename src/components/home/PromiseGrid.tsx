import { Ban, ChartLine, Code, DoorOpen, Lock, Receipt, ShieldCheck, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chapter } from "./Chapter";

const ENTRIES = [
  { title: "Each fill itemised on-chain", icon: Receipt, body: "Mid, spread, skew and fee all sit in the fill event, exactly as on the ticket.", check: "compare any fill on Blockscout with its receipt" },
  { title: "Never a fill beyond the band", icon: ShieldCheck, body: "Enforced as a contract invariant rather than a policy, for RFQ and the vault path equally.", check: "run the public invariant suite" },
  { title: "Unfiltered execution quality", icon: ChartLine, body: "How far each fill landed from the mid, shown live and available as a raw download.", check: "rebuild the figures from chain events" },
  { title: "Order flow is never sold", icon: Ban, body: "On-chain, the router settles each fill at the best price it can verify.", check: "work out any fill's venue comparison again" },
  { title: "Custody is never taken", icon: Lock, body: "Settlement is atomic, and vault inventory is owned by LPs rather than the venue.", check: "read the audits confirming no such function exists" },
  { title: "Withdrawals without conditions", icon: DoorOpen, body: "Whatever the vault state, and with every pause switched on, exits stay open.", check: "find halt-state withdrawals in the explorer" },
  { title: "Changes are published and timelocked", icon: Timer, body: "Each parameter change is queued alongside its rationale ahead of execution.", check: "read the governance log, whole since block one" },
  { title: "Open source with verified bytecode", icon: Code, body: "CI checks on each release that what is deployed is exactly what was audited.", check: "rebuild from the tag and compare" },
] as const;

/** Bento rhythm on large screens: three rows of four columns, with four of the cards running double. */
const WIDE = new Set([0, 5, 6, 7]);

export function PromiseGrid() {
  return (
    <Chapter
      id="ledger"
      eyebrow="Promises"
      tone="void"
      title="Eight promises, and how to check each one"
      kicker="Claiming transparency costs nothing; a commitment can be checked. Should any entry below ever fail its check, it is treated as an incident, with a public post-mortem to follow."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENTRIES.map((e, i) => {
          const Icon = e.icon;
          const wide = WIDE.has(i);
          return (
            <li key={e.title} className={cn("card card-hover flex flex-col overflow-hidden", wide && "lg:col-span-2")}>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-[10px] border border-ir-ice/25 bg-ir-ice/10 text-ir-ice">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="figure text-[12px] text-ir-fg-4">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className={cn("h-card mt-6 text-ir-fg", wide ? "text-[22px]" : "text-[18px]")}>{e.title}</h3>
                <p className={cn("mt-2.5 leading-relaxed text-ir-fg-3", wide ? "max-w-[46ch] text-[15px]" : "text-[14px]")}>
                  {e.body}
                </p>
              </div>
              <p className="flex items-baseline gap-2 border-t border-ir-line bg-white/[0.015] px-6 py-4 font-mono text-[12px] leading-relaxed">
                <span className="shrink-0 text-ir-ice">verify:</span>
                <span className="text-ir-fg-2 underline decoration-ir-ice/30 decoration-dotted underline-offset-4">{e.check}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </Chapter>
  );
}
