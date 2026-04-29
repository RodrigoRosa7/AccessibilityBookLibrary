import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

export const helpMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    if (
      /^(repetir|repita)\s+(instrucoes|instrutcoes|orientacoes|resumo)$/.test(
        normalized,
      ) ||
      /(repetir|repita|ouvir|ler).*(instrucoes|instrutcoes|orientacoes|resumo).*(pagina|tela)/.test(
        normalized,
      ) ||
      /^(instrucoes|instrutcoes|orientacoes|resumo).*(pagina|tela)$/.test(
        normalized,
      ) ||
      /^(ler|ouvir).*(instrucoes|instrutcoes|orientacoes)$/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.REPEAT_PAGE_GUIDANCE,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  // CLOSE_MODAL before OPEN_VOICE_HELP: "fechar ajuda" must close, not open help
  ({ normalized }) => {
    if (
      /^(fechar|fechar modal|fechar ajuda|fechar pedido|cancelar)$/.test(
        normalized,
      ) ||
      /(fechar|cancelar).*(modal|janela|ajuda|pedido)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.CLOSE_MODAL,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(me ajud[ea]|me ajudem|me ajuda|pode me ajudar|preciso(?: de)? ajuda|quero ajuda)/.test(
        normalized,
      ) ||
      /(comandos? de voz|ajuda de voz|ajuda do assistente)/.test(normalized) ||
      /(ajuda|help|socorro).*(voz|comandos|assistente)?/.test(normalized) ||
      /(abrir|mostrar|ver).*(ajuda|comandos de voz)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.OPEN_VOICE_HELP,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /^(ler|leia|ouvir)\s+(o\s+)?titulo$/.test(normalized) ||
      /^qual\s+o\s+titulo$/.test(normalized) ||
      /^qual\s+e\s+o\s+titulo$/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_TITLE,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(ler|leia).*(descricao|sinopse|detalhes)/.test(normalized) ||
      /^(descricao|detalhes)$/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_DESCRIPTION,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },
];
