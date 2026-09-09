import { MapScreen } from "@/components/map/MapScreen";
import { EVENTS_REVALIDATE_SECONDS, getEvents } from "@/services/api";
import type { Metadata } from "next";

export const revalidate = EVENTS_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Mapa — HackTown",
  description:
    "Mapa interativo do HackTown 2026 com os palcos numerados e os locais da sua agenda.",
};

interface MapaPageProps {
  searchParams: { dia?: string };
}

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const events = await getEvents();
  return <MapScreen events={events} initialDay={searchParams.dia} />;
}
