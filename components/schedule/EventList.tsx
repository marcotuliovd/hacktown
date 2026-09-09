import { groupEventsByStartTime } from "@/lib/schedule";
import type { EventListItemData } from "@/types/event";
import { EventListItem } from "./EventListItem";

interface EventListProps {
  events: EventListItemData[];
}

export function EventList({ events }: EventListProps) {
  const groups = groupEventsByStartTime(events);

  if (groups.length === 0) {
    return (
      <p className="py-12 font-sans text-sm text-text-secondary">
        Nenhum evento neste dia.
      </p>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <section key={group.time} aria-label={`A partir de ${group.time}`}>
          {group.events.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}
        </section>
      ))}
    </div>
  );
}
