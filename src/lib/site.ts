/** Brand constants used throughout the site. */
export const SITE = {
  name: "Iridius",
  domain: "iridius.xyz",
  url: "https://iridius.xyz",
  xHandle: "@iridiusxyz",
  xUrl: "https://x.com/iridiusxyz",
  githubUrl: "https://github.com/iridiusxyz",
  contactEmail: "hello@iridius.xyz",
  appHref: "/platform",
} as const;

/** Homepage chapters, listed in the order they are read. */
export const NAV_LINKS = [
  { no: "01", label: "Pricing", href: "#pricing" },
  { no: "02", label: "Sessions", href: "#sessions" },
  { no: "03", label: "Venue", href: "#venue" },
  { no: "04", label: "Compared", href: "#compare" },
  { no: "05", label: "Chain", href: "#chain" },
  { no: "06", label: "Promises", href: "#ledger" },
  { no: "07", label: "Questions", href: "#faq" },
] as const;

/** Only a handful of chapters earn a header slot; the footer links to the others. */
export const HEADER_LINKS = NAV_LINKS.filter((l) =>
  ["Pricing", "Sessions", "Venue", "Questions"].includes(l.label)
);
