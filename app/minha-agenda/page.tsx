import { AgendaDashboard } from "@/components/agenda/AgendaDashboard";
import { getEvents } from "@/services/api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha agenda — HackTown",
  description:
    "Agendas salvas do HackTown 2026: criar, editar, excluir e exportar para o Google Calendar.",
};

export default async function MinhaAgendaPage() {
  const events = await getEvents();
  return <AgendaDashboard events={events} />;
}
