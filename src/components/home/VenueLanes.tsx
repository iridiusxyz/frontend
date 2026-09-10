import { BriefcaseBusiness, FileSignature, Layers, Route, Users, Vault } from "lucide-react";
import { Chapter } from "./Chapter";

const LANES = [
  {
    name: "Anchor vaults",
    icon: Vault,
    does: "Show two-sided quotes in every market around the guarded Chainlink mid, with tier, session and inventory setting the spread. Standard-size orders fill here immediately.",
    gets: "A price from a formula you can work out yourself, and LP income that reflects what the market truly pays for immediacy, not what arbitrage leaves behind.",
  },
  {
    name: "RFQ makers",
    icon: FileSignature,
    does: "Block-size requests reach attested market makers off-chain, and they reply with signed quotes. Quoting is free for them, and they only win when they beat the vault.",
    gets: "Orders big enough to walk a curve are put to competition instead, then settled atomically against the maker's own wallet via a standing Permit2 allowance.",
  },
  {
    name: "The router",
    icon: Route,
    does: "A single entry point. It verifies eligibility and the band, prices both the vault path and any RFQ quote, then settles the one that pays you more.",
    gets: "A token-to-token swap executes as two legs via USDG within one transaction. Should either leg fail to clear within its guards, both are reverted.",
  },
] as const;

const FIGURES = [
  { v: "75 bps", k: "The hard bound", s: "The oracle band for Tier A. Whatever the parameters, no fill from a vault or a maker settles any further than this from the guarded mid." },
  { v: "2 bps", k: "The whole fee", s: "Listed on the ticket and logged in the fill event, together with 10% of the vault's realised spread. None of it is tucked inside a curve." },
  { v: "None", k: "Custody", s: "Assets stay in your wallet or in vaults owned by LPs. Because settlement is atomic, the venue holds nothing that could be lost." },
] as const;

const SEATS = [
  { who: "Traders", icon: Users, what: "Swap around the clock at itemised prices, with the session shown right on the ticket." },
  { who: "Liquidity providers", icon: Layers, what: "Put capital in a vault and collect the spread. Withdrawals are in kind and function in any state, halted or paused, even if your attestation has expired." },
  { who: "Market makers", icon: BriefcaseBusiness, what: "Quote off-chain at no cost, win only when you beat the vault, and settle atomically." },
] as const;

export function VenueLanes() {
  return (
    <Chapter
      id="venue"
      eyebrow="Venue"
      tone="deep"
      title="One router in front of two venues"
      kicker="Standard-size orders fill against vaults anchored to the oracle, while block-size orders go to professional makers as signed quotes. Whichever pays you more is what the router settles."
    >
      {/* The rail: one lit line joining the three lanes, a node above each card. */}
      <div className="relative hidden h-10 md:block" aria-hidden="true">
        <div className="absolute left-[16.66%] right-[16.66%] top-1/2 h-px bg-gradient-to-r from-ir-ice/50 via-ir-ice/25 to-ir-ice/50" />
        <div className="grid h-full grid-cols-3 gap-5">
          {LANES.map((l) => (
            <div key={l.name} className="relative flex items-center justify-center">
              <span className="relative z-10 size-2.5 rounded-full border border-ir-ice/60 bg-ir-base shadow-[0_0_12px_rgb(142_182_232/0.6)]" />
              <span className="absolute left-1/2 top-1/2 h-5 w-px bg-ir-ice/25" />
            </div>
          ))}
        </div>
      </div>

      <ol className="grid gap-5 md:grid-cols-3">
        {LANES.map((l, i) => {
          const Icon = l.icon;
          return (
            <li key={l.name} className="card card-hover flex flex-col p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-[12px] border border-ir-ice/25 bg-ir-ice/10 text-ir-ice">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="figure text-[12px] text-ir-fg-4">0{i + 1}</span>
              </div>
              <h3 className="h-card mt-6 text-[22px] text-ir-fg">{l.name}</h3>
              <p className="caps mt-6">What it does</p>
              <p className="mt-2.5 text-[15px] leading-[1.65] text-ir-fg-2">{l.does}</p>
              <div className="rule my-6" />
              <p className="caps">What you get</p>
              <p className="mt-2.5 text-[15px] leading-[1.65] text-ir-fg-3">{l.gets}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid overflow-hidden rounded-[20px] border border-ir-line bg-ir-surface/60 sm:grid-cols-3">
        {FIGURES.map((f, i) => (
          <div
            key={f.k}
            className={
              "p-6 md:p-7" + (i > 0 ? " border-t border-ir-line sm:border-l sm:border-t-0" : "")
            }
          >
            <p className="caps">{f.k}</p>
            <p className="figure mt-5 text-[clamp(36px,4vw,48px)] font-medium leading-none text-ir-fg">{f.v}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ir-fg-3">{f.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <p className="caps">Three seats</p>
        <ul className="mt-5 grid gap-5 md:grid-cols-3">
          {SEATS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.who} className="flex gap-4 border-t border-ir-line-strong pt-5">
                <Icon className="mt-0.5 size-[18px] shrink-0 text-ir-ice" aria-hidden="true" />
                <div>
                  <h3 className="h-card text-[17px] text-ir-fg">{s.who}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ir-fg-3">{s.what}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Chapter>
  );
}
