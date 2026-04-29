import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

export const navigationMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    if (
      /(abrir|ir|mostrar|voltar|retornar).*(home|inicio)/.test(normalized) ||
      /(voltar|retornar).*(pagina inicial|tela inicial)/.test(normalized) ||
      /(ir|abrir|mostrar).*(pagina inicial|tela inicial)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.OPEN_HOME,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(abrir|abra|ver|veja|mostrar|mostre).*(carrinho)/.test(normalized) ||
      /(voltar|retornar).*(ao|para o)?\s*carrinho/.test(normalized) ||
      /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*carrinho/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.OPEN_CART,
        entity: null,
        confidence: 0.94,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const isOpenBooks =
      /^(?:eu\s+)?(?:vou\s+|quero\s+)?continuar comprando$/.test(normalized) ||
      /(abrir|abra|ver|veja|mostrar|mostre|listar|liste)\s*(livros?|catalogo(?:\s+de\s+livros)?)/.test(
        normalized,
      ) ||
      /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*(livros?|catalogo(?:\s+de\s+livros)?)/.test(
        normalized,
      );

    if (isOpenBooks) {
      return {
        intent: VOICE_INTENTS.OPEN_BOOKS,
        entity: null,
        confidence: 0.91,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    if (
      /^(abrir|abra|ver|veja)$/.test(normalized) &&
      /\/(home)?$/.test(ctx.currentRoute)
    ) {
      return {
        intent: VOICE_INTENTS.OPEN_BOOKS,
        entity: null,
        confidence: 0.85,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(deslogar|deslogue|logout|logoff)/.test(normalized) ||
      /(faca|faça|efetue).*(logout|logoff)/.test(normalized) ||
      /(saia|sair|quero sair).*(do sistema|da conta|da aplicacao|do aplicativo|do app)/.test(
        normalized,
      ) ||
      /(encerrar|encerre|terminar|termine|fechar|feche).*(sessao|sessao atual)/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.LOGOUT,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },
];
