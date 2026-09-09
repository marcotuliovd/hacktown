"use client";

import { Button } from "@/components/ui/Button";
import { eventsByIds, formatTimeRange, type FestivalDay } from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";
import type { SelectedAgenda } from "@/types/onboarding";

interface SavedAgendaCardProps {
  day: FestivalDay;
  agenda: SelectedAgenda;
  events: HacktownEvent[];
  onEdit: () => void;
  onDelete: () => void;
}

export function SavedAgendaCard({
  day,
  agenda,
  events,
  onEdit,
  onDelete,
}: SavedAgendaCardProps) {
  const picked = eventsByIds(events, agenda.eventIds);
  const preview = picked.slice(0, 3);
  const extra = picked.length - preview.length;

  return (
    <article className="flex flex-col gap-4 border border-subtle bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-button text-neon-green">
            {day.weekday} · {day.day}/09
          </p>
          <h2 className="mt-1 font-display text-3xl leading-none text-text-primary">
            {picked.length}{" "}
            {picked.length === 1 ? "atividade" : "atividades"}
          </h2>
        </div>
        <span className="border border-neon-cyan px-2 py-1 font-sans text-xs uppercase tracking-button text-neon-cyan">
          Opção {agenda.option}
        </span>
      </div>

      {preview.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {preview.map((event) => (
            <li key={event.id} className="min-w-0">
              <p className="truncate font-display text-lg leading-none text-text-primary">
                {event.title}
              </p>
              <p className="mt-1 font-sans text-xs text-text-secondary">
                {formatTimeRange(event.start_time, event.end_time)}
                {event.venue?.name ? ` · ${event.venue.name}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-sans text-sm text-text-secondary">
          Os eventos desta agenda não estão mais na programação.
        </p>
      )}

      {extra > 0 ? (
        <p className="font-sans text-xs uppercase tracking-button text-text-secondary">
          +{extra} {extra === 1 ? "atividade" : "atividades"}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button href={`/minha-agenda/${day.iso}`} className="w-full sm:flex-1">
          Ver agenda
        </Button>
        <Button
          href={`/mapa?dia=${day.iso}`}
          variant="cyan"
          className="w-full sm:flex-1"
        >
          Ver no mapa
        </Button>
        <Button variant="cyan" onClick={onEdit} className="w-full sm:flex-1">
          Editar
        </Button>
        <Button
          variant="magenta"
          onClick={onDelete}
          className="w-full sm:flex-1"
        >
          Excluir
        </Button>
      </div>
    </article>
  );
}
