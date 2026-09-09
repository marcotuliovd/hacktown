import { Button } from "@/components/ui/Button";
import { resolveMapsUrl } from "@/lib/maps";
import { formatTimeRange, getEventImageUrl } from "@/lib/schedule";
import type { HacktownEvent, HacktownSpeaker } from "@/types/event";

interface EventDetailProps {
  event: HacktownEvent;
}

function getSpeakers(event: HacktownEvent): HacktownSpeaker[] {
  return event.event_speakers
    .map((link) => link.speakers)
    .filter((speaker): speaker is HacktownSpeaker => speaker != null);
}

export function EventDetail({ event }: EventDetailProps) {
  const imageUrl = getEventImageUrl(event);
  const mapsUrl = resolveMapsUrl(event.venue);
  const time = formatTimeRange(event.start_time, event.end_time);
  const venueName = event.venue?.name;
  const speakers = getSpeakers(event);

  return (
    <article className="flex min-h-dvh flex-col bg-bg-base">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-surface sm:aspect-[21/9]">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={event.title}
              className="h-full w-full object-cover [filter:grayscale(100%)_contrast(120%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-neon-green opacity-60 mix-blend-multiply"
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl text-text-secondary/30">
              HackTown
            </span>
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {event.activity_type ? (
            <span className="border border-subtle px-2 py-1 font-sans text-xs uppercase tracking-button text-text-primary">
              {event.activity_type}
            </span>
          ) : null}
          {event.age_rating ? (
            <span className="border border-neon-magenta px-2 py-1 font-sans text-xs uppercase tracking-button text-neon-magenta">
              {event.age_rating}
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-4xl leading-[0.9] text-text-primary sm:text-6xl">
          {event.title}
        </h1>

        <dl className="grid gap-3 font-sans text-sm text-text-secondary">
          <div>
            <dt className="uppercase tracking-button text-neon-green">Horário</dt>
            <dd className="mt-1 text-text-primary">{time}</dd>
          </div>
          {venueName ? (
            <div>
              <dt className="uppercase tracking-button text-neon-green">Local</dt>
              <dd className="mt-1 text-text-primary">{venueName}</dd>
              {event.venue?.area ? (
                <dd className="text-text-secondary">{event.venue.area}</dd>
              ) : null}
            </div>
          ) : null}
        </dl>

        {mapsUrl ? (
          <Button href={mapsUrl} variant="cyan" className="w-fit">
            Como chegar
          </Button>
        ) : null}

        {event.description ? (
          <section aria-labelledby="event-about">
            <h2
              id="event-about"
              className="font-sans text-xs uppercase tracking-button text-neon-green"
            >
              Sobre
            </h2>
            <p className="mt-2 whitespace-pre-line font-sans text-base leading-relaxed text-text-secondary">
              {event.description}
            </p>
          </section>
        ) : null}

        {speakers.length > 0 ? (
          <section aria-labelledby="event-speakers">
            <h2
              id="event-speakers"
              className="font-sans text-xs uppercase tracking-button text-neon-green"
            >
              Palestrantes
            </h2>
            <ul className="mt-4 flex flex-col gap-5">
              {speakers.map((speaker, index) => (
                <li
                  key={speaker.id ?? `${speaker.name ?? "speaker"}-${index}`}
                  className="border border-subtle bg-bg-surface p-4"
                >
                  <div className="flex gap-4">
                    {speaker.photo_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-bg-base">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={speaker.photo_url}
                          alt=""
                          className="h-full w-full object-cover [filter:grayscale(100%)_contrast(120%)]"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-neon-green opacity-60 mix-blend-multiply"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      {speaker.name ? (
                        <h3 className="font-display text-2xl leading-none text-text-primary">
                          {speaker.name}
                        </h3>
                      ) : null}
                      {speaker.cargo_empresa ? (
                        <p className="mt-1 font-sans text-sm text-text-secondary">
                          {speaker.cargo_empresa}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {speaker.mini_bio ? (
                    <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-text-secondary">
                      {speaker.mini_bio}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
