import { ScheduleSkeleton } from "@/components/schedule/ScheduleSkeleton";

export default function OnboardingLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6">
      <ScheduleSkeleton />
    </div>
  );
}
