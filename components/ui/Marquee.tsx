import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MarqueeProps {
  /** Conteúdo do letreiro (texto ou nós). */
  children: ReactNode;
  /** Duração de um ciclo completo, em segundos. Padrão: 20. */
  durationSeconds?: number;
  className?: string;
}

/**
 * Marquee — letreiro infinito via CSS keyframes, usado para alertas.
 * O conteúdo é duplicado para garantir um loop contínuo sem lacunas.
 * Respeita prefers-reduced-motion (ver app/globals.css).
 */
export function Marquee({
  children,
  durationSeconds = 20,
  className,
}: MarqueeProps) {
  const style = {
    "--marquee-duration": `${durationSeconds}s`,
  } as CSSProperties;

  return (
    <div
      role="marquee"
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        "relative w-full overflow-hidden border-y border-subtle bg-bg-surface py-2",
        className,
      )}
    >
      <div className="flex w-max animate-marquee" style={style}>
        {/* Duas cópias idênticas: a animação desloca -50%, criando o loop */}
        <MarqueeTrack>{children}</MarqueeTrack>
        <MarqueeTrack aria-hidden="true">{children}</MarqueeTrack>
      </div>
    </div>
  );
}

function MarqueeTrack({
  children,
  "aria-hidden": ariaHidden,
}: {
  children: ReactNode;
  "aria-hidden"?: "true";
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-8 pr-8 font-sans text-sm font-semibold uppercase tracking-button text-neon-green"
    >
      {children}
    </div>
  );
}
