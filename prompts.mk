Sequencia de prompts para construção do site:
após constrir marque o prompt com feito para que na nova sessão ja saiba de onde parou.
revise o trabalho feito ao final do prompt 
construa testes e melhores praticas de desenvolvimento.
o arquivo do mapa está na raiz do projeto index.html
o site deve ser responsivo, considerando sempre em primeiro plano o mobile.



**Prompt 1: Setup Inicial, Design System e UI Base** ✅ FEITO
"Inicie um projeto Next.js (App Router, TypeScript, Tailwind CSS). Configure o tema no `tailwind.config.ts` com a seguinte paleta dark mode: Fundo (`#0B0C10`, `#1F2833`), Acentos Neon (Acid Green `#CCFF00`, Hot Magenta `#FF007F`, Electric Cyan `#00FFFF`), Textos (`#FFFFFF`, `#B0B3B8`). Configure as fontes: uma Display Font (ex: Monument Extended ou Bebas Neue) para títulos em uppercase/italic, e uma Sans-serif (Inter) para corpo. Crie componentes base:

1. `Button`: Fundo transparente, borda de 2px neon (`#CCFF00`), cantos retos, uppercase, letter-spacing de 1.5px e efeito hover com background preenchido, texto preto e box-shadow de glow.
2. `EventCard`: Container blocky/modular com bordas finas (`rgba(255,255,255,0.1)`). Imagens devem usar filtro `grayscale(100%) contrast(120%)` e overlay com mix-blend-mode na cor neon.
3. `Marquee`: Um componente de letreiro infinito via CSS keyframes para alertas.
Garanta uma arquitetura leve focada em Server Components."

**Prompt 2: Integração de Dados, Caching e UI Pública (Programação)** ✅ FEITO
"Crie a camada de dados para consumir a API REST do Supabase fornecida (URL: `[https://xbsooiedncsrmrhjasvk.supabase.co/rest/v1/events](https://xbsooiedncsrmrhjasvk.supabase.co/rest/v1/events)?...`). Como são cerca de 2000 eventos, utilize fetch com ISR (Incremental Static Regeneration) do Next.js e deduplicação para garantir carregamento extremamente rápido.
Crie a visualização pública da programação:

1. Uma lista enxuta e objetiva. O estado default deve exibir automaticamente o dia atual do evento.
2. Lógica de tempo real: Palestras com `end_time` anterior à hora atual devem ter opacidade reduzida (grayed out).
3. Ao clicar no card da lista, abra o evento em uma view de tela cheia (aba cheia) mostrando: Título em destaque, horários, local (com link real para mapas), tipo, classificação, descrição e foto tratada. Adicione suporte a skeleton loaders durante o fetching no client (se necessário) para UX sem fricção."

**Prompt 3: Detalhes do evento (descrição, mapas, palestrantes)** ✅ FEITO
1. Renderize a `description` completa com a fonte de leitura (Inter) na cor secundária (`#B0B3B8`).
2. Se `venue.latitude` e `venue.longitude` não forem null, crie um botão 'Como chegar' gerando um deep link dinâmico para o Google Maps (`[https://www.google.com/maps/search/?api=1&query=$](https://www.google.com/maps/search/?api=1&query=$){lat},${lng}`) ou use o `venue.maps_url` (caso preenchido posteriormente).
3. Mostre a classificação indicativa (`age_rating`).
4. Liste todos os palestrantes iterando sobre o array `event_speakers`, exibindo `mini_bio` e `cargo_empresa` de cada um."

**Prompt 4: Onboarding Flow - Passo 1 (Trilhas e Agendamento Sequencial)** ✅ FEITO
"Crie o fluxo de onboarding inicial para usuários logados. O fluxo deve ter uma barra de progresso fixa no rodapé.

1. **Passo A:** Tela para seleção múltipla das trilhas favoritas (extraídas do array `event_tracks` da API).
2. **Passo B:** Tela de montagem da 'Opção de Agenda 1'. Apresente os eventos filtrados por tipo/trilha. A navegação deve ser obrigatoriamente sequencial por horário (ex: escolheu evento das 09h, a UI desliza automaticamente para a lista de opções das 10h, e assim até o fim do dia).
3. Permita que o usuário repita esse fluxo para criar as 'Opção 2' e 'Opção 3' (opcional)."

**Prompt 5: Onboarding Flow - Passo 2 (Comparativo, Mapas e Seleção)** ✅ FEITO
"Construa a tela final de decisão do onboarding.

1. Renderize um carrossel em tela cheia com cards flutuantes apresentando o resumo das 3 opções de agenda criadas.
2. Integre um mapa estático ou interativo (ex: Leaflet/Google Maps) no card, mostrando os pontos (`venue.latitude`, `venue.longitude`) sequencialmente (ex: Ponto A -> Ponto B).
3. Inclua um cálculo simulado/estimado de tempo de caminhada entre os locais para basear o comparativo.
4. Adicione o CTA 'Selecionar esta agenda' estilizado com neon. Ao clicar, salve definitivamente essa agenda no perfil do usuário no banco de dados (ou estado simulado) e conclua o onboarding do dia."

**Prompt 6: Área Logada, Gestão de Agendas e Exportação** ✅ FEITO
"Desenvolva o painel do participante logado.

1. Exiba as agendas salvas como cards para acesso rápido, com opção de criar agenda para outros dias, editar a agenda atual ou excluir agendas.
2. No detalhe da agenda do dia, crie a funcionalidade 'Adicionar ao Google Calendar'. Implemente a geração de URLs dinâmicas para o formato de evento do Google Calendar (`[https://calendar.google.com/calendar/render?action=TEMPLATE&text=](https://calendar.google.com/calendar/render?action=TEMPLATE&text=)[titulo]&dates=[inicio]/[fim]&details=[descrição]&location=[endereço]`), processando cada evento da agenda selecionada. O campo location deve ser injetado de forma precisa usando `venue.name` + localização do HackTown, garantindo que o app de mapas do celular abra corretamente ao ser clicado no Google Agenda."

**Prompt 7: Tipagem de Dados (TypeScript) e Fetching Service** ✅ FEITO
"Com base no retorno da API do Supabase, crie as interfaces TypeScript no diretório `types` (ex: `types/event.ts`) para tipagem estrita do projeto. Crie a interface principal `HacktownEvent` com os tipos exatos do payload: `id` (string), `title` (string), horários (`start_time`, `end_time`), `venue` (objeto aninhado com `name`, `area`, `latitude`, `longitude`), `event_tracks` (array de objetos contendo `tracks`) e `event_speakers` (array de objetos contendo `speakers` com `photo_url` e `name`).
Em seguida, crie um arquivo de serviço (ex: `services/api.ts`) usando o App Router do Next.js. Configure a requisição `GET` com tipagem de retorno `HacktownEvent[]`. Utilize a tag de revalidação ou o `next: { revalidate: 3600 }` para manter o cache leve e atualizado em background."

**Prompt 8: Construção do Componente EventCard** ✅ FEITO
"Crie o componente UI `EventCard.tsx` que receba via props um objeto do tipo `HacktownEvent`.

1. Renderize o `title` com a tipografia de display (uppercase/italic).
2. Extraia e formate o bloco de tempo usando `start_time` e `end_time`.
3. Renderize o local acessando `venue.name`.
4. Faça uma verificação: se existir `event_speakers[0].speakers.photo_url`, exiba a foto de capa usando o CSS de filtro grayscale e overlay de mix-blend-mode na cor neon.
5. Adicione um badge para `activity_type` (ex: Experiência, Palestra).
6. Implemente o botão 'Saiba Mais' estilizado no padrão neon que, ao clicar, passará o objeto completo para o componente de Modal/Aba Cheia."

**Prompt 9:  Autenticação via QR Code e Gestão de Estado**
"Implemente o sistema de login exclusivo para participantes. Crie uma rota `/login` com um leitor/input de QR Code simulado. O QR Code contém o ID do usuário.

1. Desenvolva a persistência dessa sessão (utilize cookies ou localStorage/Zustand) para manter o usuário logado.
2. Crie a estrutura de rotas protegidas (aba do participante).
3. Desenvolva um estado global (Store) que guardará temporariamente as escolhas do onboarding: trilhas favoritas, opções de agenda draft (até 3 opções) e agenda final consolidada."
Lógica de Aba Cheia (Event Details)**
"Construa o componente de visualização de detalhes do evento (pode ser uma intercepting route do Next.js ou um Drawer component). Este componente receberá o `HacktownEvent` selecionado.
