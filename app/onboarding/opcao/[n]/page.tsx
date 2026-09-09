import { AgendaBuilder } from "@/components/onboarding/AgendaBuilder";
import { parseAgendaOptionIndex, toOnboardingEvent } from "@/lib/onboarding";
import { filterEventsByDay, resolveFestivalDay } from "@/lib/schedule";
import { EVENTS_REVALIDATE_SECONDS, getEvents } from "@/services/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = EVENTS_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Montar agenda — HackTown",
  description: "Escolha os eventos na ordem dos horários do dia.",
};

interface AgendaOptionPageProps {
  params: { n: string };
  searchParams: { dia?: string };
}

export default async function AgendaOptionPage({
  params,
  searchParams,
}: AgendaOptionPageProps) {
  const option = parseAgendaOptionIndex(params.n);
  if (!option) notFound();

  const events = await getEvents();
  const dayIso = resolveFestivalDay(searchParams.dia);
  const ofDay = filterEventsByDay(events, dayIso).map(toOnboardingEvent);

  return <AgendaBuilder option={option} dayIso={dayIso} events={ofDay} />;
}
