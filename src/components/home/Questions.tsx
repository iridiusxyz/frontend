import { ArrowUpRight, Mail, Plus } from "lucide-react";
import { SITE } from "@/lib/site";
import { Chapter } from "./Chapter";

const FAQS = [
  {
    q: "Does Iridius count as an exchange?",
    a: "It is a swap venue that never takes custody. Oracle-anchored vaults and competing makers supply the quotes, settlement happens atomically on Robinhood Chain, and the venue never holds your assets. You will find no order book and no account to top up.",
  },
  {
    q: "How come the spread is wider at night than it was this afternoon?",
    a: "Because the underlying market has shut. Liquidity providers carry the gap until the next open, so quotes in a closed session take a ×3 spread multiplier and smaller clips. Before you sign, the regime badge on the ticket always displays the multiplier that applies.",
  },
  {
    q: "Does buying tokenized AAPL make me an Apple shareholder?",
    a: "No. What you hold is a Stock Token, an ERC-20 debt security from Robinhood Assets (Jersey) Ltd that follows the share, with dividends building up inside the token via its ERC-8056 multiplier. Your first swap comes with a disclosure that explains the distinction.",
  },
  {
    q: "Where does LP income really come from?",
    a: "They earn the spread realised on their vault's fills, less the protocol's 10% cut, which accrues into value per share. There are no emissions and no points. Impermanent loss in the AMM sense does not apply, since anchored vaults are not drained by reference-price arbitrage; the genuine risks, inventory and weekend gaps, are spelled out and priced in.",
  },
  {
    q: "Who decides what the price is?",
    a: "A formula applied to public state sets them: the guarded Chainlink mid, the tier half-spread multiplied by the session multiplier, the inventory skew, and an itemised fee. No one at Iridius can alter a single quote or fill, and parameters can only move through a timelock that comes with a published rationale.",
  },
  {
    q: "Which assets follow Stock Tokens?",
    a: "At the guarded launch, Tier A equity markets run under visible caps. After that comes the long tail of Stock Tokens as their feeds and reviews finish, followed by tokenized treasuries and gold via the same listing checklist, then the public API and SDK, and finally the handover to governance. No phase opens until the previous one has produced the evidence.",
  },
  {
    q: "Is it possible to build Iridius into my own app?",
    a: "Yes. The router is a public contract whose interface stays stable, eligibility is tied to your users' wallets and not to your app, and the quote API and TypeScript SDK arrive in the roadmap's infrastructure phase. No partner tier exists, and the reference front end gets no privileged route.",
  },
] as const;

export function Questions() {
  return (
    <Chapter
      id="faq"
      eyebrow="FAQ"
      tone="deep"
      title="Questions answered, on the record"
      kicker="Here you get the short answers. The documentation carries the full ones, maths and failure modes included."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="caps">Still asking?</p>
            <p className="mt-4 text-[15px] leading-relaxed text-ir-fg-2">
              <span className="figure text-ir-fg">{FAQS.length}</span> short answers here. For anything else, read the
              source or write to us.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                GitHub
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a href={`mailto:${SITE.contactEmail}`} className="btn btn-ghost btn-sm">
                <Mail className="size-4" aria-hidden="true" />
                Contact
              </a>
            </div>
          </div>
        </aside>

        <div className="card overflow-hidden rounded-[28px]">
          <div className="divide-hair">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group" open={i === 0}>
                <summary className="flex min-h-[64px] list-none items-start gap-5 px-6 py-5 transition-colors hover:bg-white/[0.02] md:px-7 [&::-webkit-details-marker]:hidden">
                  <span className="figure mt-1 w-6 shrink-0 text-[12px] text-ir-fg-4">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h-card flex-1 text-[17px] text-ir-fg md:text-[18px]">{f.q}</h3>
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-ir-line-strong text-ir-fg-3 transition-[transform,color,border-color] duration-300 group-open:rotate-45 group-open:border-ir-ice/40 group-open:text-ir-ice">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[15px] leading-[1.7] text-ir-fg-2 md:pl-[72px] md:pr-16">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Chapter>
  );
}
