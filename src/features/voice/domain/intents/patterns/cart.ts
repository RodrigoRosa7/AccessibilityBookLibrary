import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

const GENERIC_TARGETS = new Set([
  "item",
  "itens",
  "um item",
  "o item",
  "ultimo",
  "ultima",
  "ultimo item",
  "ultima item",
  "livro",
  "carrinho",
  "item do carrinho",
  "itens do carrinho",
]);

function extractRemoveBookEntity(normalized: string): string | null {
  const patterns = [
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(?:o\s+)?(?:livro\s+)(.+)$/,
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(.+)\s+(?:do|de)\s+carrinho$/,
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const raw = match?.[1]?.trim();
    if (raw) {
      const entity = raw
        .replace(/^(de|do|da)\s+/, "")
        .replace(/\s+(do|de)\s+carrinho$/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
      if (entity && !GENERIC_TARGETS.has(entity)) {
        return entity;
      }
    }
  }
  return null;
}

export const cartMatchers: IntentMatcher[] = [
  ({ normalized }) => {
    if (
      /(adicionar|adicione|comprar|compre|quero comprar).*(carrinho)?/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.ADD_TO_CART,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const entity = extractRemoveBookEntity(normalized);
    if (entity) {
      return {
        intent: VOICE_INTENTS.REMOVE_BOOK_FROM_CART,
        entity,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (/(limpar|esvaziar|zerar).*(carrinho)/.test(normalized)) {
      return {
        intent: VOICE_INTENTS.CLEAR_CART,
        entity: null,
        confidence: 0.93,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    const shortAlias =
      ctx.currentRoute === "/cart" &&
      (/^(ler|leia|ouvir|listar|liste)\s+(os\s+)?itens$/.test(normalized) ||
        /^(itens|itens no carrinho|itens do carrinho)$/.test(normalized));

    if (
      shortAlias ||
      /(ler|leia|ouvir|listar|liste).*(itens?|livros?).*(carrinho)/.test(
        normalized,
      ) ||
      /(carrinho).*(ler|leia|ouvir|listar|liste).*(itens?|livros?)/.test(
        normalized,
      ) ||
      /(quais|quais sao).*(itens?|livros?).*(carrinho)/.test(normalized)
    ) {
      return {
        intent: VOICE_INTENTS.READ_CART_ITEMS,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }, ctx) => {
    if (/(itens?|livros?|quantidade)/.test(normalized)) return null;

    if (
      /(informe|informar|diga|fale|mostrar|mostre|qual).*(total).*(carrinho)/.test(
        normalized,
      ) ||
      /(total).*(carrinho)/.test(normalized) ||
      /(carrinho).*(total)/.test(normalized) ||
      (ctx.currentRoute === "/cart" &&
        /^(qual o total|total|informe o total)$/.test(normalized))
    ) {
      return {
        intent: VOICE_INTENTS.READ_CART_TOTAL,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(quantos?|quantidade|total).*(itens?|livros?).*(carrinho)/.test(
        normalized,
      ) ||
      /(carrinho).*(quantos?|quantidade|total).*(itens?|livros?)/.test(
        normalized,
      ) ||
      /^(quantos?\s+itens?|quantidade\s+de\s+itens?|total\s+de\s+itens?)$/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.READ_CART_ITEMS_COUNT,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /^(remover|remova|tirar|tire|excluir|apagar)$/.test(normalized) ||
      /(remover|remova|tirar|tire|excluir|apagar).*(item|ultimo|ultima|carrinho)/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.REMOVE_CART_ITEM,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },
];
