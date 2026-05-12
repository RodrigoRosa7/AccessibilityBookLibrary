# Library Bookstore — Protótipo Web Speech API

Aplicação web de livraria com foco em acessibilidade, navegação por voz e interação por teclado. Desenvolvida como projeto acadêmico na Unisinos (Projeto Final II).

## Objetivo

Demonstrar um fluxo de compra acessível (WCAG 2.1 AA) com:

- reconhecimento de voz para navegação e ações da aplicação (Web Speech API, pt-BR);
- síntese de voz para feedback ao usuário;
- busca por texto e por voz no catálogo de livros;
- carrinho com controle de quantidade e checkout com histórico de pedidos;
- dark mode com toggle manual e suporte a `prefers-color-scheme`;
- testes de acessibilidade automatizados com axe-core.

## Stack

- React 19 + TypeScript (strict, 100%)
- Vite + React Router v7
- @primer/react (componentes de UI)
- MSW (mock de API)
- Vitest + jsdom + axe-core (testes unitários e de acessibilidade)
- eslint-plugin-jsx-a11y (lint de acessibilidade)

## Como executar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # type-check + build de produção
npm run preview   # preview do build
```

## Testes

```bash
npm test            # executa todos os testes uma vez
npm run test:watch  # modo interativo
npm run lint        # ESLint + jsx-a11y
npm run lint:types  # checagem de tipos sem build
```

## Estrutura principal

```
src/
  app/                    # providers (Auth, Cart), router, hooks (useDarkMode)
  components/             # chrome global: Layout, Navbar, GlobalVoiceAssistant,
                          # VoiceHelpPanel, VoiceOnboardingDialog, VoiceButton,
                          # VoiceFeedbackBanner, RouteVoiceGuidance
  features/
    auth/                 # authService.ts
    books/                # BookCard, BookCardSkeleton, bookService.ts
    cart/                 # cartService.ts
    contextual/           # pageVoiceGuidance.ts (instruções por rota)
    onboarding/           # voiceOnboarding.ts (onboarding versionado)
    voice/
      components/         # VoiceAssistantPanel
      domain/intents/     # registry de matchers por grupo (navigation, search, cart…)
      hooks/              # useVoiceAssistant, useVoiceCommands, useVoiceFeedback, useVoicePagination
      services/           # voiceEvents.ts (barramento de eventos tipado)
  pages/                  # LoginPage, HomePage, BooksPage, BookDetailsPage, CartPage, CheckoutPage
  shared/ui/              # Accordion, AppButton (CSS Modules)
  styles/                 # tokens CSS, reset, tipografia, globals, componentes
  types/                  # tipos de domínio compartilhados
```

## Pipeline de voz

`GlobalVoiceAssistant` é um conector fino (~40 linhas) que chama `useVoiceAssistant`, o hook orquestrador que compõe:

1. `useSpeechRecognition` — `SpeechRecognition` API (Chrome/Edge; barra de espaço ativa escuta)
2. `useVoiceCommands` → `parseVoiceIntent` (registry de matchers) → `handleVoiceCommand`
3. `useVoiceFeedback` → `useSpeechSynthesis` (fila de falas)
4. `useVoicePagination` — paginação de resultados de busca por voz

Comunicação entre componentes via `voiceEvents.ts` (barramento tipado, substitui `window.dispatchEvent` direto).

## Comandos de voz

Documentados em [docs/voice-commands.md](docs/voice-commands.md): comandos globais, por rota, exemplos de frases e variações.

## Modo de testes sem login

Para sessões de teste com usuários com deficiência visual, é possível desativar a tela de login para reduzir fricção (ditar e-mail/senha por voz adiciona dificuldade desnecessária ao avaliar acessibilidade do fluxo principal).

A flag é controlada pela variável de ambiente do Vite `VITE_DISABLE_AUTH`:

1. Crie um arquivo `.env.local` na raiz do projeto com o conteúdo:

   ```
   VITE_DISABLE_AUTH=true
   ```

2. Reinicie o dev server (`npm run dev`) — o Vite só lê variáveis de ambiente na inicialização.

Com a flag ligada:

- A aplicação abre direto em `/home`, autenticada como um usuário convidado mockado (Ana Silva).
- A rota `/login` redireciona automaticamente para `/home` em qualquer carga inicial.
- O botão **Sair** (e o comando de voz "Sair") permanecem funcionais — após executar, o usuário é levado à tela de login para que a UX completa de logout possa ser testada.
- Pressionar **F5** na tela de login recarrega o app e a flag re-injeta o convidado, retornando para `/home`.
- Carrinho, checkout, comandos de voz e onboarding versionado de voz continuam funcionando normalmente.

Para desativar, remova a variável (ou defina `VITE_DISABLE_AUTH=false`) e reinicie o dev server. O fluxo padrão de login com `ana@librarybooks.com` / `f@cR9oPVAh` volta a ser exigido.

**Aviso**: este modo é exclusivo para a fase de testes locais. Não usar em build de produção destinado a deploy público.

## Atalhos do assistente de voz

- **F2** ou **Ctrl+M** — liga/desliga o microfone do assistente. Os dois atalhos estão ativos em paralelo para permitir testes com leitores de tela; ajuste se algum conflitar com o leitor em uso.
- **Ctrl** (sozinho) — interrompe a fala em andamento do assistente, sem encerrar a sessão de escuta.
- **Velocidade da fala** — botão **1x / 2x / 3x** ao lado do microfone cicla entre os valores; por voz, diga `velocidade 2 vezes`, `aumentar velocidade 3` ou `velocidade 1x`. A faixa aceita é 1 a 3, e o valor é mantido apenas durante a sessão (reset ao recarregar).
- Ao ativar ou desativar o microfone, um bip curto (agudo na ativação, mais grave na desativação) confirma a mudança sem depender de fala.

## Saída de áudio com fone de ouvido (P2/USB)

A Web Speech API (`SpeechSynthesisUtterance`) **não** permite escolher o dispositivo de saída — o áudio segue o dispositivo padrão do sistema operacional no momento em que a aba foi aberta. Se conectar um fone após carregar a página, a fala pode continuar no alto-falante do notebook.

Workarounds:

1. Conecte o fone **antes** de abrir a aplicação no navegador, ou recarregue a página após conectar.
2. Confira o dispositivo padrão do sistema operacional (Windows: Configurações → Sistema → Som).
3. Quando o NVDA estiver ativo, confira separadamente a saída configurada nele (`NVDA + Ctrl + S` → Audio Output Device) — leitor de tela e Web Speech API podem usar dispositivos diferentes.

## Observações

- A aplicação usa dados mockados via MSW; não há backend real.
- Reconhecimento de voz requer Chrome ou Edge (Firefox bloqueado explicitamente).
- `@axe-core/react` está ativo em modo de desenvolvimento — violações de acessibilidade são logadas no console do browser.
