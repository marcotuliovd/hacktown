import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "green" | "magenta" | "cyan";

const variantClasses: Record<ButtonVariant, string> = {
  green:
    "border-neon-green text-neon-green hover:bg-neon-green hover:text-black hover:shadow-glow focus-visible:ring-neon-green",
  magenta:
    "border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black hover:shadow-glow-magenta focus-visible:ring-neon-magenta",
  cyan: "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black hover:shadow-glow-cyan focus-visible:ring-neon-cyan",
};

export function buttonClassName(
  variant: ButtonVariant = "green",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-none border-2 bg-transparent px-6 py-3",
    "font-sans text-sm font-semibold uppercase tracking-button",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:shadow-none",
    variantClasses[variant],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Cor neon do acento. Padrão: green (Acid Green). */
  variant?: ButtonVariant;
  /** Se informado, renderiza um Next.js Link com o mesmo visual. */
  href?: string;
  children?: ReactNode;
}

/**
 * Button — fundo transparente, borda 2px neon, cantos retos, uppercase e
 * letter-spacing de 1.5px. No hover preenche o fundo com a cor neon, texto
 * preto e aplica box-shadow de glow.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "green", className, type, children, href, ...props },
    ref,
  ) => {
    const classes = buttonClassName(variant, className);

    if (href) {
      const isExternal = /^https?:\/\//.test(href);
      if (isExternal) {
        return (
          <a
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
