import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NAV_LINKS, SITE } from "@/lib/site";

const PRODUCT = [
  { label: "Launch app", href: SITE.appHref },
  ...NAV_LINKS.slice(0, 4).map((l) => ({ label: l.label, href: l.href })),
] as const;

const MORE = NAV_LINKS.slice(4).map((l) => ({ label: l.label, href: l.href }));

const OUTSIDE = [
  { label: `X · ${SITE.xHandle}`, href: SITE.xUrl },
  { label: "GitHub", href: SITE.githubUrl },
  { label: "Contact", href: `mailto:${SITE.contactEmail}` },
] as const;

/** Mark and statement on the left, three link columns on the right, and the small print beneath. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ir-line bg-ir-void">
      <div className="page pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={32} />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-ir-fg-3">
              On Robinhood Chain, a swap venue for tokenized real-world assets that never takes custody.
              Prices anchored to oracles, fees itemised, settlement atomic in USDG.
            </p>
          </div>
          <Column title="Product" links={PRODUCT} />
          <Column title="Learn" links={MORE} />
          <Column title="Elsewhere" links={OUTSIDE} external />
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-ir-line pt-6 font-mono text-[11.5px] text-ir-fg-4 sm:flex-row sm:justify-between">
          <span>&copy; 2026 Iridius · {SITE.domain}</span>
        </div>
      </div>
    </footer>
  );
}

function Column({
  title,
  links,
  external = false,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="caps">{title}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            {external ? (
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-[14px] text-ir-fg-2 transition-colors hover:text-ir-fg"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[14px] text-ir-fg-2 transition-colors hover:text-ir-fg">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
