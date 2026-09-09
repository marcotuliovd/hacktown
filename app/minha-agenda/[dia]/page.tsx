import { AgendaDayDetail } from "@/components/agenda/AgendaDayDetail";
import { isFestivalDay } from "@/lib/schedule";
import { getEvents } from "@/services/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface AgendaDayPageProps {
  params: { dia: string };
}

export function generateMetadata({ params }: AgendaDayPageProps): Metadata {
  return {
    title: `Agenda ${params.dia} — HackTown`,
    description: "Detalhe da agenda do dia e exportação para o Google Calendar.",
  };
}

export default async function AgendaDayPage({ params }: AgendaDayPageProps) {
  if (!isFestivalDay(params.dia)) notFound();

  const events = await getEvents();
  return <AgendaDayDetail dayIso={params.dia} events={events} />;
}
