"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventModal } from "@/components/schedule/EventModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatTimeRange, getEventCardCoverUrl } from "@/lib/schedule";
import type { HacktownEvent } from "@/types/event";

type NeonAccent = "green" | "magenta" | "cyan";

export interface EventCardProps {
  event: HacktownEvent;
  accent?: NeonAccent;
  /** Chamado com o evento completo ao abrir a aba cheia. */
  onLearnMore?: (event: HacktownEvent) => void;
  className?: string;
}

const accentOverlay: Record<NeonAccent, string> = {
  green: "bg-neon-green",
  magenta: "bg-neon-magenta",
  cyan: "bg-neon-cyan",
};

const accentBorder: Record<NeonAccent, string> = {
  green: "before:bg-neon-green",
  magenta: "before:bg-neon-magenta",
  cyan: "before:bg-neon-cyan",
};

/**
 * EventCard — recebe um `HacktownEvent`. Título em display, horário, local,
 * badge de tipo e capa do palestrante (grayscale + overlay neon).
 * “Saiba Mais” passa o objeto completo para a aba cheia (`EventModal`).
 */
export function EventCard({
  event,
  accent = "green",
  onLearnMore,
  className,
}: EventCardProps) {
  const [open, setOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const coverRef = useRef<HTMLImageElement>(null);
  const coverUrl = getEventCardCoverUrl(event);
  const speakerName = event.event_speakers[0]?.speakers?.name;
  const time = formatTimeRange(event.start_time, event.end_time);
  const venueName = event.venue?.name;

  useEffect(() => {
    setCoverFailed(false);
  }, [coverUrl]);

  useEffect(() => {
    const img = coverRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setCoverFailed(true);
    }
  }, [coverUrl]);

  const openDetail = useCallback(() => {
    onLearnMore?.(event);
    setOpen(true);
  }, [event, onLearnMore]);

  const closeDetail = useCallback(() => setOpen(false), []);

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-none border border-subtle bg-bg-surface",
          "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:content-['']",
          accentBorder[accent],
          className,
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-bg-base">
          {coverUrl && !coverFailed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={coverRef}
                src={coverUrl}
                alt={speakerName ?? event.title}
                loading="lazy"
                onError={() => setCoverFailed(true)}
                className="h-full w-full object-cover [filter:grayscale(100%)_contrast(120%)]"
              />
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply",
                  accentOverlay[accent],
                )}
              />
            </>
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-bg-base"
            >
              <span className="font-display text-4xl text-text-secondary/40">
                HackTown
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {event.activity_type ? (
            <span className="w-fit border border-subtle px-2 py-1 font-sans text-xs uppercase tracking-button text-text-primary">
              {event.activity_type}
            </span>
          ) : null}

          <h3 className="font-display text-2xl leading-none text-text-primary">
            {event.title}
          </h3>

          <p className="font-sans text-sm tabular-nums text-neon-green">
            {time}
          </p>

          {venueName ? (
            <p className="font-sans text-sm text-text-secondary">{venueName}</p>
          ) : null}

          <Button
            variant={accent}
            onClick={openDetail}
            className="mt-auto w-full sm:w-fit"
          >
            Saiba Mais
          </Button>
        </div>
      </article>

      {open ? <EventModal event={event} onClose={closeDetail} /> : null}
    </>
  );
}
