import Link from "next/link";
import { FESTIVAL_DAYS } from "@/lib/schedule";
import { cn } from "@/lib/cn";

interface DayTabsProps {
  selected: string;
  /** Gera o href de cada dia. Padrão: programação pública. */
  hrefForDay?: (iso: string) => string;
}

export function DayTabs({ selected, hrefForDay }: DayTabsProps) {
  return (
    <nav
      aria-label="Dias do festival"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {FESTIVAL_DAYS.map((day) => {
        const isActive = day.iso === selected;
        return (
          <Link
            key={day.iso}
            href={
              hrefForDay
                ? hrefForDay(day.iso)
                : `/programacao?dia=${day.iso}`
            }
            aria-current={isActive ? "date" : undefined}
            className={cn(
              "flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-none border px-3 py-2",
              "font-sans text-xs uppercase tracking-button",
              isActive
                ? "border-neon-green bg-neon-green text-black"
                : "border-subtle text-text-secondary hover:border-neon-green hover:text-neon-green",
            )}
          >
            <span className="font-display text-2xl leading-none">{day.day}</span>
            <span>{day.weekday}</span>
          </Link>
        );
      })}
    </nav>
  );
}
