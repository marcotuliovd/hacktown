"use client";

import { Button } from "@/components/ui/Button";
import {
  agendaPlaceTimeLabel,
  type AgendaPlaceStop,
} from "@/lib/agenda-venues";
import { cn } from "@/lib/cn";

interface AgendaPlacesListProps {
  stops: AgendaPlaceStop[];
  selectedN: number | null;
  onSelect: (n: number | null, key?: string) => void;
  hasAgenda: boolean;
  hydrated: boolean;
  dayLabel?: string;
}

export function AgendaPlacesList({
  stops,
  selectedN,
  onSelect,
  hasAgenda,
  hydrated,
  dayLabel,
}: AgendaPlacesListProps) {
  if (!hydrated) {
    return (
      <p className="px-4 py-8 font-sans text-sm text-text-secondary">
        Carregando seus locais…
      </p>
    );
  }

  if (!hasAgenda) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <h2 className="font-display text-3xl leading-none text-text-primary">
          Seus lugares
        </h2>
        <p className="font-sans text-sm text-text-secondary">
          Monte a agenda do dia para ver aqui os palcos e casas que você precisa
          visitar — na ordem da programação.
        </p>
        <Button href="/onboarding" className="w-full">
          Montar minha agenda
        </Button>
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-display text-3xl leading-none text-text-primary">
          Seus lugares
        </h2>
        <p className="mt-3 font-sans text-sm text-text-secondary">
          Os eventos desta agenda não estão mais na programação.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <h2 className="sticky top-0 z-10 bg-bg-base px-4 pb-2 pt-3 font-sans text-[11px] font-black uppercase tracking-button text-neon-green">
        {dayLabel ? `${dayLabel} · ` : null}
        Lugares da agenda · {stops.length}
      </h2>
      <ol className="flex flex-col">
        {stops.map((stop) => {
          const isActive = stop.n != null && stop.n === selectedN;
          return (
            <li key={stop.key}>
              <button
                type="button"
                onClick={() => onSelect(stop.n, stop.key)}
                className={cn(
                  "flex min-h-12 w-full items-start gap-3 border-b border-subtle px-4 py-3 text-left",
                  isActive ? "bg-bg-surface" : "hover:bg-bg-surface/60",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center font-sans text-xs font-black",
                    stop.n == null
                      ? "bg-bg-surface text-text-secondary"
                      : "bg-neon-green text-black",
                  )}
                >
                  {stop.n ?? "–"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl leading-none text-text-primary">
                    {stop.name}
                  </span>
                  <span className="mt-1 block font-sans text-xs tabular-nums text-neon-cyan">
                    {agendaPlaceTimeLabel(stop)}
                  </span>
                  {stop.events.map((item) => (
                    <span
                      key={item.id}
                      className="mt-1 block truncate font-sans text-xs text-text-secondary"
                    >
                      {item.title}
                    </span>
                  ))}
                  {stop.n == null ? (
                    <span className="mt-1 block font-sans text-[10px] uppercase tracking-button text-neon-magenta">
                      Sem pin no mapa
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
