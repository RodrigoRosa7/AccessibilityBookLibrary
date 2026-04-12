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

    case VOICE_INTENTS.READ_SEARCH_RESULTS:
      actions.readSearchResults?.();
      return "";

    case VOICE_INTENTS.READ_NEXT_SEARCH_RESULTS:
      actions.readNextSearchResults?.();
      return "";

    case VOICE_INTENTS.READ_PREVIOUS_SEARCH_RESULTS:
      actions.readPreviousSearchResults?.();
      return "";

    case VOICE_INTENTS.REPEAT_SEARCH_RESULTS:
      actions.repeatSearchResults?.();
      return "";

    case VOICE_INTENTS.REPEAT_PAGE_GUIDANCE:
      actions.repeatPageGuidance?.();
      return "";

    case VOICE_INTENTS.OPEN_VOICE_HELP:
      actions.openVoiceHelp?.();
      return "";

    case VOICE_INTENTS.CLOSE_MODAL:
      actions.closeModal?.();
      return "";

    case VOICE_INTENTS.LOGOUT:
      actions.logout?.();
      return "";

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

    case VOICE_INTENTS.CLEAR_CART:
      actions.clearCartItems?.();
      return "";

    case VOICE_INTENTS.READ_CART_ITEMS:
      actions.readCartItems?.();
      return "";

    case VOICE_INTENTS.READ_CART_TOTAL:
      actions.readCartTotal?.();
      return "";

    case VOICE_INTENTS.READ_CART_ITEMS_COUNT:
      actions.readCartItemsCount?.();
      return "";

    case VOICE_INTENTS.REMOVE_CART_ITEM:
      actions.removeLastCartItem?.();
      return "";

    case VOICE_INTENTS.REMOVE_BOOK_FROM_CART:
      actions.removeBookFromCart?.(entity ?? "");
      return "";

    case VOICE_INTENTS.CHECKOUT:
      actions.openCheckout?.();
      return "";

    case VOICE_INTENTS.CONFIRM_CHECKOUT:
      actions.confirmCheckout?.();
      return "";

    case VOICE_INTENTS.GO_BACK:
      actions.goBack?.();
      return "Voltando para a tela anterior.";

    case VOICE_INTENTS.READ_DESCRIPTION:
      if (actions.readDescription) {
        actions.readDescription();
      } else {
        actions.onDescriptionUnavailable?.();
      }
      return "";

    case VOICE_INTENTS.OPEN_HOME:
      actions.openHome?.();
      return "Voltando para a página inicial.";

    default:
      actions.onUnknown?.(intentResult);
      return "Comando de voz não reconhecido.";
  }
}
