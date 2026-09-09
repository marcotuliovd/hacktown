import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais (clsx) resolvendo conflitos do Tailwind (tailwind-merge).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
