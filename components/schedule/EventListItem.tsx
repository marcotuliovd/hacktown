"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatTimeRange, isEventEnded } from "@/lib/schedule";
import type { EventListItemData } from "@/types/event";

interface EventListItemProps {
  event: EventListItemData;
}

export function EventListItem({ event }: EventListItemProps) {
  const [ended, setEnded] = useState(() =>
    isEventEnded(event.event_date, event.end_time),
  );

  useEffect(() => {
    const tick = () => setEnded(isEventEnded(event.event_date, event.end_time));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [event.event_date, event.end_time]);

  const time = formatTimeRange(event.start_time, event.end_time);

  return (
    <Link
      href={`/programacao/${event.id}`}
      data-ended={ended ? "true" : "false"}
      aria-label={`${event.title}. ${time}${event.venueName ? `. ${event.venueName}` : ""}`}
      className={cn(
        "flex gap-4 border-b border-subtle px-0 py-3 transition-opacity",
        "hover:bg-bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green",
        ended && "opacity-40",
      )}
    >
      <time
        dateTime={`${event.event_date}T${event.start_time}`}
        className="w-24 shrink-0 font-sans text-xs tabular-nums text-neon-green"
      >
        {time}
      </time>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl leading-none text-text-primary">
          {event.title}
        </h3>
        <p className="mt-1 truncate font-sans text-sm text-text-secondary">
          {[event.venueName, event.activityType].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
