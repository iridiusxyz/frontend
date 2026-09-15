import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Firmament } from "@/components/Firmament";

/** The final band: the mark lit against the stars, the way in, and the route still to come. */
export function Closing() {
  return (
    <section className="relative isolate overflow-hidden bg-ir-void">
      <div className="hairline absolute inset-x-0 top-0" aria-hidden="true" />
      <Firmament seed={23} density={110} className="-z-10 opacity-80" />
      <div className="glow pointer-events-none absolute left-1/2 top-[8%] -z-10 size-[min(900px,130vw)] -translate-x-1/2" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ir-void to-transparent"
        aria-hidden="true"
      />

      <div className="page py-28 md:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative mx-auto size-28 md:size-36">
            <div className="glow breathe absolute -inset-10" aria-hidden="true" />
            <Image
              src="/images/mark-hero.png"
              alt=""
              width={288}
              height={288}
              className="relative size-full rounded-[28px] object-contain"
            />
          </div>

          <h2 className="h-section mt-12 text-[clamp(44px,7.5vw,96px)] text-ir-fg">
            Trading <span className="text-lit">is open.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-[52ch] text-[16px] leading-[1.65] text-ir-fg-2 md:text-[17px]">
            Once verified, traders can start swapping within minutes. LPs earn the spread by funding vaults,
            makers quote at no cost, and each fill settles on Robinhood Chain.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={SITE.appHref} className="btn btn-primary btn-lg">
              Open the venue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={SITE.xUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
              Follow {SITE.xHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
