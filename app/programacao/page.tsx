import { DayTabs } from "@/components/schedule/DayTabs";
import { EventList } from "@/components/schedule/EventList";
import { SiteHeader } from "@/components/schedule/SiteHeader";
import {
  FESTIVAL_DAYS,
  filterEventsByDay,
  resolveFestivalDay,
  toListItem,
} from "@/lib/schedule";
import { getEvents } from "@/services/api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programação — HackTown",
  description: "Programação oficial do HackTown 2026, dia a dia.",
};

interface ProgramacaoPageProps {
  searchParams: { dia?: string };
}

export default async function ProgramacaoPage({
  searchParams,
}: ProgramacaoPageProps) {
  const events = await getEvents();
  const selected = resolveFestivalDay(searchParams.dia);
  const ofDay = filterEventsByDay(events, selected).map(toListItem);
  const selectedMeta = FESTIVAL_DAYS.find((d) => d.iso === selected);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <p className="font-sans text-xs uppercase tracking-button text-neon-green">
          Programação oficial
        </p>
        <h1 className="mb-6 font-display text-4xl leading-none text-text-primary sm:text-5xl">
          {selectedMeta
            ? `${selectedMeta.day} ${selectedMeta.weekday}`
            : "Agenda"}
        </h1>
        <div className="sticky top-[45px] z-10 -mx-4 mb-4 bg-bg-base/95 px-4 py-3 backdrop-blur">
          <DayTabs selected={selected} />
        </div>
        <p className="mb-2 font-sans text-xs text-text-secondary">
          {ofDay.length} {ofDay.length === 1 ? "atividade" : "atividades"}
        </p>
        <EventList events={ofDay} />
      </main>
    </div>
  );
}
