import { Button } from "@/components/ui/Button";
import type { AgendaOptionIndex } from "@/types/onboarding";

interface AgendaCompleteProps {
  option: AgendaOptionIndex;
  pickCount: number;
  onCreateNext: () => void;
  onFinish: () => void;
}

export function AgendaComplete({
  option,
  pickCount,
  onCreateNext,
  onFinish,
}: AgendaCompleteProps) {
  const nextOption =
    option === 1 ? 2 : option === 2 ? 3 : null;

  return (
    <section className="border border-neon-green bg-bg-base p-4">
      <p className="font-sans text-xs uppercase tracking-button text-neon-green">
        Opção {option} pronta
      </p>
      <h2 className="mt-2 font-display text-3xl leading-none text-text-primary">
        {pickCount} {pickCount === 1 ? "atividade" : "atividades"} na agenda
      </h2>
      <p className="mt-2 font-sans text-sm text-text-secondary">
        {nextOption
          ? "Crie outra opção para comparar, ou avance para o comparativo."
          : "Três opções montadas. Compare e selecione a agenda do dia."}
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {nextOption ? (
          <Button onClick={onCreateNext} className="w-full">
            Criar opção {nextOption}
          </Button>
        ) : null}
        <Button
          variant={nextOption ? "cyan" : "green"}
          onClick={onFinish}
          className="w-full"
        >
          Comparar agendas
        </Button>
      </div>
    </section>
  );
}
