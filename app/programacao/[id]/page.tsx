import { EventDetail } from "@/components/schedule/EventDetail";
import { SiteHeader } from "@/components/schedule/SiteHeader";
import { EVENTS_REVALIDATE_SECONDS, getEventById } from "@/services/api";
import { notFound } from "next/navigation";

export const revalidate = EVENTS_REVALIDATE_SECONDS;
export const dynamicParams = true;

interface EventPageProps {
  params: { id: string };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader backHref="/programacao" backLabel="Programação" />
      <EventDetail event={event} />
    </div>
  );
}
