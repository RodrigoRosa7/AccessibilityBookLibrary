import { VOICE_INTENTS } from "../../../../../types";
import type { IntentMatcher } from "../types";

function extractOrderNumber(normalized: string): string | null {
  const match = normalized.match(
    /(?:abrir|mostrar|ver)\s+(?:o\s+)?pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );
  return match?.[1] ?? null;
}

function extractOrderNumberFromReadCommand(normalized: string): string | null {
  const match = normalized.match(
    /(?:ler|leia|ouvir)\s+.*pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );
  return match?.[1] ?? null;
}

export const checkoutMatchers: IntentMatcher[] = [
  ({ normalized }, ctx) => {
    if (
      /^(confirmar|ok|sim|prosseguir|continuar|aprovar)$/.test(normalized) &&
      ctx.currentRoute === "/cart"
    ) {
      return {
        intent: VOICE_INTENTS.CONFIRM_CHECKOUT,
        entity: null,
        confidence: 0.95,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(finalizar|concluir|fechar).*(compra|pedido)|(?:abrir|ir|mostrar).*(pedidos)|^pedidos$/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.CHECKOUT,
        entity: null,
        confidence: 0.92,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const hasOrderContext = /(pedido|pedidos|compra|compras)/.test(normalized);
    const hasNextSignal =
      /(proxim[oa]|seguinte|depois|avancar|avanca|prossim[oa]|proxmo)/.test(
        normalized,
      ) ||
      /(ir|vai|mostrar|abrir|trocar).*(proxim[oa]|seguinte)/.test(normalized);

    if (hasOrderContext && hasNextSignal) {
      return {
        intent: VOICE_INTENTS.OPEN_NEXT_ORDER,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const hasOrderContext = /(pedido|pedidos|compra|compras)/.test(normalized);
    const hasPreviousSignal =
      /(anterior|passad[oa]|antes|atras|retroceder|retrocede)/.test(
        normalized,
      ) ||
      /(voltar|retornar).*(pedido|compra).*(anterior|antes|atras|passad[oa])/.test(
        normalized,
      );

    if (hasOrderContext && hasPreviousSignal) {
      return {
        intent: VOICE_INTENTS.OPEN_PREVIOUS_ORDER,
        entity: null,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    const orderNumber = extractOrderNumber(normalized);
    if (orderNumber) {
      return {
        intent: VOICE_INTENTS.OPEN_ORDER,
        entity: orderNumber,
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },

  ({ normalized }) => {
    if (
      /(ler|leia|ouvir).*(pedido|dados do pedido|detalhes do pedido)/.test(
        normalized,
      )
    ) {
      return {
        intent: VOICE_INTENTS.READ_ORDER_DETAILS,
        entity: extractOrderNumberFromReadCommand(normalized),
        confidence: 0.9,
        transcript: normalized,
      };
    }
    return null;
  },
];
