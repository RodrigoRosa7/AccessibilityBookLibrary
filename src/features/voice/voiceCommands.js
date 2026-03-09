import { VOICE_INTENTS } from "./intentParser.js";

export function handleVoiceCommand(intentResult, actions = {}) {
  const { intent, entity } = intentResult;

  switch (intent) {
    case VOICE_INTENTS.OPEN_BOOKS:
      actions.openBooks?.();
      return "Abrindo catálogo de livros.";

    case VOICE_INTENTS.SEARCH_BOOK:
      actions.searchBook?.(entity ?? "");
      return entity
        ? `Buscando livro: ${entity}.`
        : "Não entendi o termo de busca.";

    case VOICE_INTENTS.OPEN_BOOK_DETAILS:
      if (!entity) {
        return "Não entendi qual livro você quer abrir.";
      }

      actions.openBookDetails?.(entity);
      return `Buscando detalhes de ${entity}.`;

    case VOICE_INTENTS.OPEN_ORDER:
      if (!entity) {
        return "Não entendi o número do pedido.";
      }

      actions.openOrder?.(entity);
      return "";

    case VOICE_INTENTS.READ_ORDER_DETAILS:
      actions.readOrderDetails?.(entity ?? null);
      return "";

    case VOICE_INTENTS.OPEN_NEXT_ORDER:
      actions.openNextOrder?.();
      return "";

    case VOICE_INTENTS.OPEN_PREVIOUS_ORDER:
      actions.openPreviousOrder?.();
      return "";

    case VOICE_INTENTS.OPEN_CART:
      actions.openCart?.();
      return "Abrindo carrinho.";

    case VOICE_INTENTS.ADD_TO_CART:
      if (actions.addCurrentBookToCart) {
        actions.addCurrentBookToCart();
        return "Adicionando livro ao carrinho.";
      }
      return "Este comando funciona na página de detalhes do livro.";

    case VOICE_INTENTS.CHECKOUT:
      actions.openCheckout?.();
      return "Abrindo checkout para finalizar a compra.";

    case VOICE_INTENTS.GO_BACK:
      actions.goBack?.();
      return "Voltando para a tela anterior.";

    case VOICE_INTENTS.READ_DESCRIPTION:
      if (actions.readDescription) {
        actions.readDescription();
        return "Lendo descrição do livro.";
      }
      return "Abra os detalhes de um livro para ouvir a descrição.";

    case VOICE_INTENTS.OPEN_HOME:
      actions.openHome?.();
      return "Voltando para a página inicial.";

    default:
      actions.onUnknown?.(intentResult);
      return "Comando de voz não reconhecido.";
  }
}
