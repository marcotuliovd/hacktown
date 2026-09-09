import { Button } from "@/components/ui/Button";

export default function AgendaDayNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <p className="font-sans text-xs uppercase tracking-button text-neon-magenta">
        404
      </p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">
        Dia fora do festival
      </h1>
      <p className="mt-3 font-sans text-sm text-text-secondary">
        A agenda do participante cobre os dias 3 a 7 de setembro.
      </p>
      <Button href="/minha-agenda" className="mt-6 w-full max-w-xs">
        Voltar às agendas
      </Button>
    </main>
  );
}
