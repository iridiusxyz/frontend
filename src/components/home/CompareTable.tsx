import { Check, Minus } from "lucide-react";
import { Chapter } from "./Chapter";

const ROWS = [
  { what: "Price", them: "Set by whatever sits in the pool's reserves", us: "Pinned to the Chainlink mid and held inside a hard band" },
  { what: "Weekends", them: "A Saturday priced as though it were a Tuesday", us: "In closed sessions spreads widen and clips shrink, shown on the ticket" },
  { what: "LP returns", them: "Picked off by arbitrage whenever the reference price moves", us: "They earn the spread, and skew pays the market to rebalance them" },
  { what: "Splits", them: "The pool breaks or has to migrate", us: "The market halts, then resumes on the adjusted feed" },
  { what: "Size", them: "Pays its way down the curve", us: "Routed to competing makers as signed RFQ quotes" },
  { what: "Fees", them: "Hidden inside the curve", us: "Listed line by line on the quote and logged in the fill event" },
] as const;

export function CompareTable() {
  return (
    <Chapter
      id="compare"
      eyebrow="Compared"
      tone="void"
      title="Generic pools treat RWAs as if they were memecoins"
      kicker="Constant-product pools work for crypto-native pairs but fall short for assets whose price of record is set on an exchange. The dislocations at the 2025 launch, when thin pools quoted tokenized stocks at steep premiums, showed that gap in public."
    >
      {/* Desktop: a three-column matrix with the Iridius column lit from within. */}
      <div className="card hidden overflow-hidden rounded-[28px] md:block">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[40%]" />
            <col className="w-[40%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="caps px-7 pb-5 pt-7 align-bottom font-medium">Property</th>
              <th scope="col" className="px-7 pb-5 pt-7 align-bottom font-normal">
                <span className="caps">Compared with</span>
                <span className="h-card mt-3 block text-[19px] text-ir-fg-3">A generic pool</span>
              </th>
              <th
                scope="col"
                className="relative border-x border-t border-ir-ice/25 bg-ir-ice/[0.07] px-7 pb-5 pt-7 align-bottom font-normal"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ir-ice-bright to-transparent" aria-hidden="true" />
                <span className="caps !text-ir-ice">Oracle-anchored</span>
                <span className="h-card mt-3 block text-[19px] text-ir-fg">Iridius</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.what} className="align-top">
                <th scope="row" className="border-t border-ir-line px-7 py-5 text-[15px] font-medium text-ir-fg">
                  {r.what}
                </th>
                <td className="border-t border-ir-line px-7 py-5">
                  <span className="flex gap-3 text-[14.5px] leading-relaxed text-ir-fg-3">
                    <Minus className="mt-[3px] size-4 shrink-0 text-ir-fg-4" aria-hidden="true" />
                    {r.them}
                  </span>
                </td>
                <td
                  className={
                    "border-x border-t border-ir-ice/25 border-t-ir-ice/15 bg-ir-ice/[0.07] px-7 py-5" +
                    (i === ROWS.length - 1 ? " pb-7" : "")
                  }
                >
                  <span className="flex gap-3 text-[14.5px] leading-relaxed text-ir-fg-2">
                    <Check className="mt-[3px] size-4 shrink-0 text-ir-ice" aria-hidden="true" />
                    {r.us}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per property, the two answers stacked. */}
      <ul className="flex flex-col gap-4 md:hidden">
        {ROWS.map((r) => (
          <li key={r.what} className="card overflow-hidden">
            <div className="card-head">
              <h3 className="h-card text-[17px] text-ir-fg">{r.what}</h3>
            </div>
            <dl className="divide-hair">
              <div className="flex gap-3 px-5 py-4">
                <Minus className="mt-[3px] size-4 shrink-0 text-ir-fg-4" aria-hidden="true" />
                <div>
                  <dt className="caps">A generic pool</dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-ir-fg-3">{r.them}</dd>
                </div>
              </div>
              <div className="flex gap-3 bg-ir-ice/[0.07] px-5 py-4">
                <Check className="mt-[3px] size-4 shrink-0 text-ir-ice" aria-hidden="true" />
                <div>
                  <dt className="caps !text-ir-ice">Iridius</dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-ir-fg-2">{r.us}</dd>
                </div>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-10 max-w-2xl text-center text-[14.5px] leading-relaxed text-ir-fg-3">
        The two sit side by side rather than in opposition: arbitrageurs who pull generic pools towards anchored
        quotes bring welcome flow, and skew pricing rewards them for rebalancing the vaults as they go.
      </p>
    </Chapter>
  );
}
