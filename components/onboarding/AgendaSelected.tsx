import { Button } from "@/components/ui/Button";
import type { AgendaOptionIndex } from "@/types/onboarding";

interface AgendaSelectedProps {
  option: AgendaOptionIndex;
  pickCount: number;
  dayIso?: string;
}

export function AgendaSelected({
  option,
  pickCount,
  dayIso,
}: AgendaSelectedProps) {
  const panelHref = dayIso ? `/minha-agenda/${dayIso}` : "/minha-agenda";

  return (
    <section className="border border-neon-green bg-bg-base p-4 shadow-glow">
      <p className="font-sans text-xs uppercase tracking-button text-neon-green">
        Onboarding do dia
      </p>
      <h2 className="mt-2 font-display text-3xl leading-none text-text-primary">
        Agenda do dia definida
      </h2>
      <p className="mt-2 font-sans text-sm text-text-secondary">
        {`Opção ${option} salva com ${pickCount} ${
          pickCount === 1 ? "atividade" : "atividades"
        }. Gerencie, edite ou exporte no painel da sua agenda.`}
      </p>
      <Button href={panelHref} className="mt-4 w-full">
        Ver minha agenda
      </Button>
    </section>
  );
}
