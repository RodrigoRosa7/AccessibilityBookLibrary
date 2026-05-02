import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

const SEARCH_VERBS = [
  "buscar",
  "busque",
  "procurar",
  "procure",
  "encontrar",
  "pesquisar",
  "mostrar",
  "ache",
];

function extractSearchEntity(normalized: string): string | null {
  const patterns = [
    /(?:buscar|procurar|encontrar|pesquisar|mostrar)\s+(?:livro|livros)?\s*(.+)$/,
    /quero\s+(?:o\s+)?(?:livro|livros)\s+(.+)$/,
    /livro\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const raw = match?.[1]?.trim();
    if (raw) {
      return raw
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }
  return null;
}

function extractBookDetailsEntity(normalized: string): string | null {
  const patterns = [
    /(?:abrir|mostrar|ver)\s+(?:os\s+)?detalhes\s+(?:do|da|de)?\s*(?:livro\s+)?(.+)$/,
    /detalhes\s+(?:do|da|de)?\s*(?:livro\s+)?(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const raw = match?.[1]?.trim();
    if (raw) {
      return raw
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }
  return null;
}

function extractSelectBookEntity(normalized: string): string | null {
  const patterns = [
    /(?:selecionar|escolher|abrir|quero)\s+(?:o\s+)?(?:livro\s+)?(.+)$/,
    /(?:escolhi|escolha)\s+(?:o\s+)?(?:livro\s+)?(.+)$/,
    /(?:esse|aquele|este)\s+(?:livro|aqui)\s+(?:da|do|de)?\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const raw = match?.[1]?.trim();
    if (raw) {
      return raw
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }
  return null;
}

export const searchMatchers: IntentMatcher[] = [
  ({ normalized }, ctx) => {
    if (ctx.currentRoute !== "/books") return null;

    if (
      /(ler|leia|ouvir)?\s*(os\s+)?(proximos|seguintes)\s*(resultados?|livros?|titulos?)/.test(
        normalized,
      ) ||
      /(mais\s+resultados?|continuar\s+resultados?)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_NEXT_SEARCH_RESULTS,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    if (ctx.currentRoute !== "/books") return null;

    if (
      /(ler|leia|ouvir)?\s*(os\s+)?(resultados?|livros?|titulos?)\s*(anteriores|passados)/.test(
        normalized,
      ) ||
      /(voltar|retornar).*(resultados?|livros?|titulos?)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_PREVIOUS_SEARCH_RESULTS,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    if (ctx.currentRoute !== "/books") return null;

    if (
      /(repetir|repita).*(resultados?|livros?|titulos?|bloco)/.test(
        normalized,
      ) ||
      /(ler|ouvir).*(novamente).*(resultados?|livros?|titulos?|bloco)/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.REPEAT_SEARCH_RESULTS,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    if (ctx.currentRoute !== "/books") return null;

    if (
      /^(ler|leia|ouvir|mostrar|mostre|listar|liste)\s+(os\s+)?livros?\s+disponiveis$/.test(
        normalized,
      ) ||
      /^livros?\s+disponiveis$/.test(normalized) ||
      /(ler|leia|ouvir|fale|diga).*(resultados?|titulos?|livros? encontrados?)/.test(
        normalized,
      ) ||
      /(quais|quais sao).*(resultados?|titulos?)/.test(normalized) ||
      /(quais|quais sao).*(livros?).*(foram\s+)?encontrados?/.test(
        normalized,
      ) ||
      /^(resultados?|titulos?)$/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_SEARCH_RESULTS,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const entity = extractBookDetailsEntity(normalized);
    if (!entity) return null;

    return {
      intent: VOICE_INTENTS.OPEN_BOOK_DETAILS,
      entity,
      confidence: 0.9,
      transcript: normalized,
    };
  },

  ({ normalized }, ctx) => {
    if (ctx.currentRoute !== "/books") return null;

    const isSelect =
      /^(?:selecionar|escolher|quero|abrir|escolhi|escolha)\s+(?:o\s+)?(?:livro\s+)?(.+)/.test(
        normalized,
      ) || /(?:esse|aquele|este)\s+(?:livro|aqui)/.test(normalized);

    if (!isSelect) return null;
    const entity = extractSelectBookEntity(normalized);
    if (!entity) return null;

    return {
      intent: VOICE_INTENTS.SELECT_BOOK,
      entity,
      confidence: 0.9,
      transcript: normalized,
    };
  },

  ({ normalized }) => {
    const hasSearchVerb = SEARCH_VERBS.some((v) => normalized.includes(v));
    if (!hasSearchVerb && !normalized.includes("livro")) return null;

    const entity = extractSearchEntity(normalized);
    if (!entity) return null;

    return {
      intent: VOICE_INTENTS.SEARCH_BOOK,
      entity,
      confidence: 0.9,
      transcript: normalized,
    };
  },
];
