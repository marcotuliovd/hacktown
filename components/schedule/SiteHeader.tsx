import Link from "next/link";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function SiteHeader({
  backHref,
  backLabel = "Voltar",
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-subtle bg-bg-base/95 backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        {backHref ? (
          <Link
            href={backHref}
            className="font-sans text-xs uppercase tracking-button text-neon-green"
          >
            ← {backLabel}
          </Link>
        ) : (
          <Link
            href="/"
            className="shrink-0 font-display text-lg leading-none text-text-primary sm:text-xl"
          >
            HackTown
          </Link>
        )}
        <nav className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link
            href="/mapa"
            className="font-sans text-[10px] uppercase tracking-button text-text-secondary sm:text-xs"
          >
            Mapa
          </Link>
          <Link
            href="/minha-agenda"
            className="font-sans text-[10px] uppercase tracking-button text-text-secondary sm:text-xs"
          >
            Agenda
          </Link>
          <Link
            href="/programacao"
            className="whitespace-nowrap font-sans text-[10px] uppercase tracking-button text-text-secondary sm:text-xs"
          >
            Programação
          </Link>
        </nav>
      </div>
    </header>
  );
}
