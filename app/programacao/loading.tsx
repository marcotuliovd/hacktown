import { ScheduleSkeleton } from "@/components/schedule/ScheduleSkeleton";
import { SiteHeader } from "@/components/schedule/SiteHeader";

export default function ProgramacaoLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl py-6">
        <ScheduleSkeleton />
      </div>
    </div>
  );
}
