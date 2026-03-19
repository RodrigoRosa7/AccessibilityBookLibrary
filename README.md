# Prototipo Web Speech API

Aplicacao web de livraria em braille com foco em acessibilidade, navegacao por voz e interacao por teclado.

## Objetivo

O projeto demonstra um fluxo de compra acessivel com:

- reconhecimento de voz para navegacao e ações da aplicação;
- síntese de voz para feedback ao usuário;
- busca por texto e por voz no catálogo de livros;
- carrinho com controle de quantidade e checkout com histórico de pedidos.

## Stack

- React 19
- Vite
- React Router
- @primer/react
- MSW (mock de API)
- Vitest (testes)

## Como executar

1. Instale as dependencias:

```bash
npm install
```

2. Rode em modo desenvolvimento:

```bash
npm run dev
```

3. Build de produção:

```bash
npm run build
```

4. Preview do build:

```bash
npm run preview
```

## Testes

Executar todos os testes:

```bash
npm test
```

Executar em modo watch:

```bash
npm run test:watch
```

## Comandos de voz

Para evitar um README muito extenso, os comandos de voz foram documentados em arquivo dedicado por página:

- [docs/voice-commands.md](docs/voice-commands.md)

Esse guia inclui:

- comandos globais;
- comandos por rota;
- exemplos de frases aceitas e variações;
- observações sobre comandos que dependem de contexto.

## Estrutura principal

- `src/components/GlobalVoiceAssistant.jsx`: assistente de voz global
- `src/features/voice/intentParser.js`: parser de intents de voz
- `src/features/voice/voiceCommands.js`: despacho das intents para ações
- `src/features/books`: catálogo e detalhes de livros
- `src/features/cart`: carrinho e confirmação de pedido
- `src/features/checkout`: resumo de pedido e histórico

## Observações

- A aplicação usa dados mockados via MSW para simular backend.
- Alguns comandos de voz são contextuais, por exemplo leitura de descricao na tela de detalhes e leitura de pedido no checkout.
