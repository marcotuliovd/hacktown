import { AgendaCompare } from "@/components/onboarding/AgendaCompare";
import { toOnboardingEvent } from "@/lib/onboarding";
import { EVENTS_REVALIDATE_SECONDS, getEvents } from "@/services/api";
import type { Metadata } from "next";

export const revalidate = EVENTS_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Comparar agendas — HackTown",
  description:
    "Compare as opções de agenda, o deslocamento no mapa e escolha a agenda do dia.",
};

export default async function CompareAgendasPage() {
  const events = await getEvents();

  return <AgendaCompare events={events.map(toOnboardingEvent)} />;
}
