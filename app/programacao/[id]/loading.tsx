import { EventDetailSkeleton } from "@/components/schedule/ScheduleSkeleton";
import { SiteHeader } from "@/components/schedule/SiteHeader";

export default function EventLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader backHref="/programacao" backLabel="Programação" />
      <EventDetailSkeleton />
    </div>
  );
}
