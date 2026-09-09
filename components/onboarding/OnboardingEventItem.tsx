import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatTimeRange } from "@/lib/schedule";
import type { OnboardingEvent } from "@/types/onboarding";

interface OnboardingEventItemProps {
  event: OnboardingEvent;
  selected: boolean;
  onChoose: () => void;
}

export function OnboardingEventItem({
  event,
  selected,
  onChoose,
}: OnboardingEventItemProps) {
  const time = formatTimeRange(event.start_time, event.end_time);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 border p-4",
        selected ? "border-neon-green" : "border-subtle",
      )}
    >
      <h3 className="font-display text-2xl leading-none text-text-primary">
        {event.title}
      </h3>
      <p className="font-sans text-sm text-text-secondary">
        {[time, event.venueName, event.activityType]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <Button
        onClick={onChoose}
        variant={selected ? "green" : "cyan"}
        className="w-full"
      >
        {selected ? "Escolhido" : "Escolher"}
      </Button>
    </article>
  );
}
