import { cn } from "@/lib/utils";

/**
 * The frame for every homepage section: an eyebrow pill, the headline, an optional kicker, then the
 * content. `deep` sections sit on a slightly raised plane with a faint grid, so the page alternates
 * between open void and engineered surface as it scrolls.
 */
export function Chapter({
  id,
  eyebrow,
  title,
  kicker,
  tone = "void",
  align = "left",
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  kicker?: React.ReactNode;
  tone?: "void" | "deep";
  align?: "left" | "center";
  children: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <section
      id={id}
      className={cn(
        "relative isolate scroll-mt-16 overflow-hidden py-24 md:py-32",
        tone === "deep" ? "bg-ir-base" : "bg-ir-void"
      )}
    >
      <div className="hairline absolute inset-x-0 top-0" aria-hidden="true" />
      {tone === "deep" && <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />}
      <div className="page">
        <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="h-section mt-6 text-[clamp(32px,4.4vw,56px)] text-ir-fg">{title}</h2>
          {kicker && (
            <p className={cn("mt-6 max-w-[60ch] text-[16px] leading-[1.65] text-ir-fg-2 md:text-[17px]", center && "mx-auto")}>
              {kicker}
            </p>
          )}
        </div>
        <div className="mt-14 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
