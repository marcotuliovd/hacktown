# HackTown

Site do HackTown — programação, agenda personalizada e mapa do festival de inovação
e criatividade. Construído incrementalmente seguindo a sequência de prompts em
[`prompts.mk`](./prompts.mk).

## Stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** (strict)
- **Tailwind CSS 3** (dark mode, design system neon)
- **Zustand** — rascunho do onboarding e agendas salvas por dia (perfil simulado)
- **Jest** + **React Testing Library** (testes de componentes)
- **ESLint** (`eslint-config-next`)

## Como rodar

Pré-requisitos: Node.js 18+ e npm.

```bash
npm install                  # instala dependências
npm run dev                  # ambiente de desenvolvimento em http://localhost:3000
npm run build                # build de produção
npm start                    # serve o build de produção
npm run lint                 # análise estática (ESLint)
npm test                     # roda a suíte de testes (Jest)
npm run test:watch           # testes em modo watch
```

### Variáveis de ambiente

A programação vem da API REST pública do Supabase. As chaves são publishable
(`NEXT_PUBLIC_*`) e já vêm no [`.env`](./.env) commitado — o build na Vercel
não precisa de variáveis no dashboard.

| Variável                                 | Uso                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`               | `https://xbsooiedncsrmrhjasvk.supabase.co`                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`   | Chave publishable (`sb_publishable_…`) enviada no header `apikey`   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`          | Alias da mesma chave (opcional)                                     |
| `SUPABASE_EVENTS_SELECT`                 | Opcional. Sobrescreve o `select` do PostgREST                       |

O fetch da **lista** usa um `select` enxuto (sem speakers, com `description` e
`event_tracks`) e `cache: 'no-store'` — o payload com palestrantes passa de 2MB
e o Data Cache do Next recusa. O resultado normalizado é revalidado com
`unstable_cache` (1 h, tag `events`). A **ficha** busca um único evento
(`id=eq.…`) com o select completo e `next: { revalidate: 3600, tags: ['events'] }`.
O contrato público é `getEvents(): Promise<HacktownEvent[]>`.

## Design System

Dark mode com acentos neon, estética blocky/modular (cantos retos, bordas finas e
glows). Tokens definidos em [`tailwind.config.ts`](./tailwind.config.ts).

| Token             | Valor                | Uso                          |
| ----------------- | -------------------- | ---------------------------- |
| `bg-base`         | `#0B0C10`            | Fundo base                   |
| `bg-surface`      | `#1F2833`            | Superfícies elevadas         |
| `neon-green`      | `#CCFF00`            | Acento primário (Acid Green) |
| `neon-magenta`    | `#FF007F`            | Acento (Hot Magenta)         |
| `neon-cyan`       | `#00FFFF`            | Acento (Electric Cyan)       |
| `text-primary`    | `#FFFFFF`            | Texto principal              |
| `text-secondary`  | `#B0B3B8`            | Texto secundário             |

**Fontes:** Bebas Neue (display — títulos em uppercase/italic) e Inter (corpo),
carregadas via `next/font/google`.

### Componentes base (`components/ui`)

- **`Button`** — borda 2px neon, cantos retos, uppercase e letter-spacing; no hover
  preenche o fundo com glow. Variantes `green` | `magenta` | `cyan`. Aceita `href`
  para renderizar como `Link`.
- **`EventCard`** — recebe um `HacktownEvent`: título em display (uppercase/italic),
  horário (`start_time`/`end_time`), `venue.name`, badge de `activity_type` e capa
  via `event_speakers[0].speakers.photo_url` (grayscale + overlay neon). **Saiba
  Mais** passa o objeto completo para a aba cheia (`EventModal` + `EventDetail`).
- **`Marquee`** — letreiro infinito via CSS keyframes para alertas; respeita
  `prefers-reduced-motion`.

## Programação pública

- Lista enxuta em [`/programacao`](./app/programacao/page.tsx), mobile-first, com
  chips dos 5 dias (3–7 set 2026, fuso `America/Sao_Paulo`).
- Dia padrão: hoje se estiver na janela do festival; senão o primeiro (antes) ou
  o último (depois).
- Eventos com `end_time` no passado ficam com opacidade reduzida (atualizado no
  client a cada 30s).
- Clique abre a ficha em tela cheia em `/programacao/[id]`: título, horários,
  local, tipo, classificação, descrição completa (Inter, `#B0B3B8`), foto
  tratada, **Como chegar** (Google Maps via `maps_url`, lat/lng ou busca pelo
  nome em Santa Rita do Sapucaí) e lista de **palestrantes** (`name`,
  `cargo_empresa`, `mini_bio`).
- Locais do mapa antigo (`index.html`) estão em [`data/map-venues.ts`](./data/map-venues.ts)
  para casar o nome do venue com o pin.

## Onboarding (agenda)

Fluxo em [`/onboarding`](./app/onboarding/page.tsx) (ainda sem login — Prompt 9).
Rascunhos ficam no Zustand (`localStorage`, chave `hacktown-onboarding`).

1. **Trilhas** — seleção múltipla extraída de `event_tracks`.
2. **Opção 1** (`/onboarding/opcao/1`) — eventos das trilhas escolhidas, um
   horário por vez. Ao escolher, a UI avança para o próximo slot cujo início
   seja ≥ o `end_time` (sem overlap). Dá para pular um horário. Opções 2 e 3
   são opcionais.
3. **Comparativo** (`/onboarding/comparar`) — carrossel das opções montadas,
   mini-mapa A→B com os pins de [`index.html`](./index.html) e estimativa de
   caminhada. **Selecionar esta agenda** grava em `savedAgendas[dayIso]`
   (perfil simulado) e leva ao painel.

## Minha agenda (participante)

Painel em [`/minha-agenda`](./app/minha-agenda/page.tsx) (login real no Prompt 9).
Uma agenda salva por dia do festival (3–7 set): criar, editar ou excluir.

- Detalhe em `/minha-agenda/[dia]`: lista das atividades e **Adicionar ao Google
  Calendar** por evento (`lib/calendar.ts`).
- URL no formato `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ&details=…&location=…`.
- `location` = `venue.name, HackTown, Santa Rita do Sapucaí, MG` (sem venue,
  só HackTown + cidade), para o app de mapas abrir a partir do Google Agenda.

## Estrutura

```
app/                  # App Router (home, /programacao, /onboarding, /minha-agenda)
components/ui/        # Button, EventCard, Marquee
components/schedule/  # lista, ficha, tabs de dia, skeletons
components/onboarding/# trilhas, carrossel, comparativo, progresso
components/agenda/    # painel do participante e detalhe do dia
store/                # Zustand (trilhas, rascunhos, savedAgendas por dia)
data/                 # locais extraídos do mapa antigo
lib/                  # cn, schedule, maps, walking, onboarding, calendar
services/             # fetch ISR da API Supabase (`HacktownEvent[]`)
types/                # HacktownEvent e recortes de onboarding
index.html            # mapa interativo de referência (site antigo)
prompts.mk            # roteiro de construção do site
```

O arquivo [`index.html`](./index.html) é o mapa interativo do site antigo, usado como
referência visual para a construção do mapa nos próximos prompts.

## Progresso

- [x] **Prompt 1** — Setup inicial, design system e UI base
- [x] **Prompt 2** — Integração de dados (Supabase), caching e programação pública
- [x] **Prompt 3** — Detalhes do evento (descrição, mapas, palestrantes)
- [x] **Prompt 4** — Onboarding: trilhas e agendamento sequencial
- [x] **Prompt 5** — Onboarding: comparativo, mapas e seleção
- [x] **Prompt 6** — Área do participante, gestão de agendas e Google Calendar
- [x] **Prompt 7** — Tipagem de dados e serviço de fetching
- [x] **Prompt 8** — EventCard com `HacktownEvent`, capa do palestrante e aba cheia
- [ ] Prompt 9 — Autenticação via QR Code e gestão de estado
