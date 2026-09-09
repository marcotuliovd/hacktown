import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/ui/EventCard";
import { Marquee } from "@/components/ui/Marquee";
import { pickFeaturedEvents } from "@/lib/schedule";
import { getEventById, getEvents } from "@/services/api";
import type { HacktownEvent } from "@/types/event";

export const dynamic = "force-dynamic";

const FEATURED_ACCENTS = ["green", "magenta", "cyan"] as const;

async function loadFeaturedEvents(): Promise<HacktownEvent[]> {
  try {
    const list = await getEvents();
    const picks = pickFeaturedEvents(list, 3);
    if (picks.length === 0) return [];

    return Promise.all(
      picks.map(async (event) => {
        try {
          return (await getEventById(event.id)) ?? event;
        } catch {
          return event;
        }
      }),
    );
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await loadFeaturedEvents();

  return (
    <div className="flex min-h-dvh flex-col">
      <Marquee>
        <span>⚡ Programação sujeita a alterações</span>
        <span>·</span>
        <span>Confira o mapa do evento</span>
        <span>·</span>
        <span>HackTown 2026</span>
      </Marquee>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
        <section className="flex flex-col gap-6">
          <p className="font-sans text-sm uppercase tracking-button text-neon-green">
            Festival de inovação e criatividade
          </p>
          <h1 className="font-display text-6xl leading-[0.9] text-text-primary sm:text-7xl lg:text-8xl">
            Sua agenda,
            <br />
            <span className="text-neon-green">do seu jeito.</span>
          </h1>
          <p className="max-w-xl font-sans text-base text-text-secondary">
            Monte sua programação, encontre os palcos no mapa e não perca nenhum
            momento do HackTown.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/programacao">Ver programação</Button>
            <Button href="/mapa" variant="cyan">
              Ver mapa
            </Button>
            <Button href="/minha-agenda" variant="magenta">
              Minha agenda
            </Button>
            <Button href="/onboarding">Montar minha agenda</Button>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-3xl text-text-primary">
              Em destaque
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  accent={FEATURED_ACCENTS[index % FEATURED_ACCENTS.length]}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-subtle px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-5xl font-sans text-xs text-text-secondary">
          HackTown 2026 — Ministério da Cultura e Petrobras apresentam.
        </p>
      </footer>
    </div>
  );
}
