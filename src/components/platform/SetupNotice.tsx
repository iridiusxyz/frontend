import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ir-void px-4 py-16">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      <div className="card-lit relative w-full max-w-xl animate-rise overflow-hidden">
        <div className="card-head">
          <Logo size={26} />
          <span className="tag border-ir-warn/30 bg-ir-warn/[0.08] text-ir-warn">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            Setup
          </span>
        </div>

        <div className="p-6 md:p-8">
          <p className="caps text-ir-ice">Platform not configured</p>
          <h1 className="h-section mt-4 text-[26px] text-ir-fg md:text-[30px]">Some environment variables are not set</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ir-fg-2">
            Privy and Supabase supply the platform&apos;s configuration. Put the values below in{" "}
            <code className="font-mono text-[13.5px] text-ir-ice">.env.local</code>, execute{" "}
            <code className="font-mono text-[13.5px] text-ir-ice">supabase/schema.sql</code> followed by{" "}
            <code className="font-mono text-[13.5px] text-ir-ice">supabase/seed.sql</code>, and restart the dev server.
          </p>

          <ul className="mt-6 divide-hair overflow-hidden rounded-[12px] border border-ir-line bg-ir-void/60 font-mono text-[13px] text-ir-fg">
            {missing.map((m) => (
              <li key={m} className="flex items-center gap-3 px-4 py-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-ir-warn" aria-hidden="true" />
                <span className="min-w-0 break-all">{m}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[13.5px] leading-relaxed text-ir-fg-3">
            The complete setup lives in <code className="font-mono text-ir-fg-2">supabase/README.md</code>. You can also{" "}
            <Link href="/" className="text-ir-ice underline-offset-4 transition-colors hover:text-ir-ice-bright hover:underline">
              head back to the homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
