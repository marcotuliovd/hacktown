import { AgendaRouteMap } from "@/components/onboarding/AgendaRouteMap";
import { Button } from "@/components/ui/Button";
import { FESTIVAL_DAYS, formatTimeRange } from "@/lib/schedule";
import type { AgendaRoute, AgendaWalkLeg } from "@/lib/walking";
import type { AgendaOptionIndex } from "@/types/onboarding";

interface AgendaOptionCardProps {
  option: AgendaOptionIndex;
  dayIso: string;
  route: AgendaRoute;
  onSelect: () => void;
}

function walkLabel(leg: AgendaWalkLeg): string {
  const pair = `${leg.fromLabel} → ${leg.toLabel}`;
  if (leg.sameVenue) return `${pair} · mesmo local`;
  return pair;
}

export function AgendaOptionCard({
  option,
  dayIso,
  route,
  onSelect,
}: AgendaOptionCardProps) {
  const day = FESTIVAL_DAYS.find((item) => item.iso === dayIso);
  const count = route.points.length;

  return (
    <article className="flex flex-col border border-subtle bg-bg-surface shadow-glow">
      <div className="border-b border-subtle px-4 py-4">
        <p className="font-sans text-xs uppercase tracking-button text-neon-green">
          Opção {option}
          {day ? ` · ${day.day} ${day.weekday}` : ""}
        </p>
        <h2 className="mt-2 font-display text-3xl leading-none text-text-primary">
          {count} {count === 1 ? "atividade" : "atividades"}
        </h2>
      </div>

      <div className="px-4 pt-4">
        <AgendaRouteMap points={route.points} />
      </div>

      <ol className="flex flex-col gap-3 px-4 py-4">
        {route.points.map((point, index) => {
          const leg = route.legs[index];
          return (
            <li key={point.eventId} className="border-b border-subtle pb-3 last:border-b-0 last:pb-0">
              <p className="font-sans text-xs uppercase tracking-button text-neon-cyan">
                Ponto {point.label}
                {" · "}
                {formatTimeRange(point.startTime, point.endTime)}
              </p>
              <p className="mt-1 font-display text-xl leading-none text-text-primary">
                {point.title}
              </p>
              {point.venueName ? (
                <p className="mt-1 font-sans text-sm text-text-secondary">
                  {point.venueName}
                </p>
              ) : null}
              {leg ? (
                <p className="mt-2 font-sans text-xs uppercase tracking-button text-text-secondary">
                  {walkLabel(leg)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="px-4 pb-4">
        <Button onClick={onSelect} className="w-full shadow-glow">
          Selecionar esta agenda
        </Button>
      </div>
    </article>
  );
}
