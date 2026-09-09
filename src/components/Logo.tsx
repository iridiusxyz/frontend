import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size of the mark, in pixels. */
  size?: number;
  withWordmark?: boolean;
  withImage?: boolean;
  className?: string;
  href?: string;
}

/** The chevron on its navy tile, followed by the name in wide-tracked capitals. */
export function Logo({ size = 28, withImage = true, withWordmark = true, className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Go to the Iridius homepage"
      className={cn("group inline-flex items-center gap-3 text-ir-fg", className)}
    >
      {withImage && (
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={size}
          height={size}
          priority
          className="shrink-0 object-contain transition-[filter] duration-300 group-hover:brightness-125"
        />
      )}
      {withWordmark && (
        <span className="font-display text-[14px] font-medium uppercase leading-none tracking-[0.32em]">Iridius</span>
      )}
    </Link>
  );
}
