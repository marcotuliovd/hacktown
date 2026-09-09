import { SiteHeader } from "@/components/schedule/SiteHeader";

export default function EventNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader backHref="/programacao" backLabel="Programação" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
        <p className="font-sans text-xs uppercase tracking-button text-neon-magenta">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl text-text-primary">
          Evento não encontrado
        </h1>
        <p className="mt-3 font-sans text-sm text-text-secondary">
          Esse item pode ter saído da programação. Volte à lista e escolha
          outro.
        </p>
      </main>
    </div>
  );
}
