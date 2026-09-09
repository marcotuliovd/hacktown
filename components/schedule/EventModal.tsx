"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { EventDetail } from "@/components/schedule/EventDetail";
import type { HacktownEvent } from "@/types/event";

interface EventModalProps {
  event: HacktownEvent;
  onClose: () => void;
}

/**
 * Aba cheia / drawer do evento. Recebe o `HacktownEvent` completo já
 * selecionado no card (sem novo fetch).
 */
export function EventModal({ event, onClose }: EventModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 overflow-y-auto bg-bg-base"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-subtle bg-bg-base/95 px-4 py-3 backdrop-blur">
        <p
          id={titleId}
          className="min-w-0 truncate font-display text-xl leading-none text-text-primary"
        >
          {event.title}
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href={`/programacao/${event.id}`}
            className="font-sans text-xs uppercase tracking-button text-text-secondary"
          >
            Ficha
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="font-sans text-xs uppercase tracking-button text-neon-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green"
          >
            Fechar
          </button>
        </div>
      </div>
      <EventDetail event={event} />
    </div>
  );
}
