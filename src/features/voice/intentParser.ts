import {
  VOICE_INTENTS,
  type ParsedIntent,
  type ParseVoiceIntentOptions,
} from "../../types";

export { VOICE_INTENTS };
export type { ParsedIntent, ParseVoiceIntentOptions };

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

function normalizeText(text: unknown): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractSearchEntity(normalizedTranscript: string): string | null {
  const patterns = [
    /(?:buscar|procurar|encontrar|pesquisar|mostrar)\s+(?:livro|livros)?\s*(.+)$/,
    /quero\s+(?:o\s+)?(?:livro|livros)\s+(.+)$/,
    /livro\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalizedTranscript.match(pattern);
    const rawEntity = match?.[1]?.trim();

    if (rawEntity) {
      return rawEntity
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }

  return null;
}

function extractBookDetailsEntity(
  normalizedTranscript: string,
): string | null {
  const patterns = [
    /(?:abrir|mostrar|ver)\s+(?:os\s+)?detalhes\s+(?:do|da|de)?\s*(?:livro\s+)?(.+)$/,
    /detalhes\s+(?:do|da|de)?\s*(?:livro\s+)?(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalizedTranscript.match(pattern);
    const rawEntity = match?.[1]?.trim();

    if (rawEntity) {
      return rawEntity
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }

  return null;
}

function extractSelectBookEntity(normalizedTranscript: string): string | null {
  const patterns = [
    /(?:selecionar|escolher|abrir|quero)\s+(?:o\s+)?(?:livro\s+)?(.+)$/,
    /(?:escolhi|escolha)\s+(?:o\s+)?(?:livro\s+)?(.+)$/,
    /(?:esse|aquele|este)\s+(?:livro|aqui)\s+(?:da|do|de)?\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalizedTranscript.match(pattern);
    const rawEntity = match?.[1]?.trim();

    if (rawEntity) {
      return rawEntity
        .replace(/^(de|do|da|sobre)\s+/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();
    }
  }

  return null;
}

function extractRemoveBookEntity(normalizedTranscript: string): string | null {
  const genericTargets = new Set([
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

  const patterns = [
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(?:o\s+)?(?:livro\s+)(.+)$/,
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(.+)\s+(?:do|de)\s+carrinho$/,
    /(?:remover|remova|tirar|tire|excluir|apagar)\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalizedTranscript.match(pattern);
    const rawEntity = match?.[1]?.trim();

    if (rawEntity) {
      const normalizedEntity = rawEntity
        .replace(/^(de|do|da)\s+/, "")
        .replace(/\s+(do|de)\s+carrinho$/, "")
        .replace(/\s+(por favor)?$/, "")
        .trim();

      if (!normalizedEntity || genericTargets.has(normalizedEntity)) {
        continue;
      }

      return normalizedEntity;
    }
  }

  return null;
}

function extractOrderNumber(normalizedTranscript: string): string | null {
  const match = normalizedTranscript.match(
    /(?:abrir|mostrar|ver)\s+(?:o\s+)?pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );

  return match?.[1] ?? null;
}

function extractOrderNumberFromReadCommand(
  normalizedTranscript: string,
): string | null {
  const match = normalizedTranscript.match(
    /(?:ler|leia|ouvir)\s+.*pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );

  return match?.[1] ?? null;
}

function isNextOrderCommand(normalizedTranscript: string): boolean {
  const hasOrderContext = /(pedido|pedidos|compra|compras)/.test(
    normalizedTranscript,
  );

  const hasNextSignal =
    /(proxim[oa]|seguinte|depois|avancar|avanca|prossim[oa]|proxmo)/.test(
      normalizedTranscript,
    ) ||
    /(ir|vai|mostrar|abrir|trocar).*(proxim[oa]|seguinte)/.test(
      normalizedTranscript,
    );

  return hasOrderContext && hasNextSignal;
}

function isPreviousOrderCommand(normalizedTranscript: string): boolean {
  const hasOrderContext = /(pedido|pedidos|compra|compras)/.test(
    normalizedTranscript,
  );

  const hasPreviousSignal =
    /(anterior|passad[oa]|antes|atras|retroceder|retrocede)/.test(
      normalizedTranscript,
    ) ||
    /(voltar|retornar).*(pedido|compra).*(anterior|antes|atras|passad[oa])/.test(
      normalizedTranscript,
    );

  return hasOrderContext && hasPreviousSignal;
}

function isVoiceHelpCommand(normalizedTranscript: string): boolean {
  return (
    /(me ajud[ea]|me ajudem|me ajuda|pode me ajudar|preciso(?: de)? ajuda|quero ajuda)/.test(
      normalizedTranscript,
    ) ||
    /(comandos? de voz|ajuda de voz|ajuda do assistente)/.test(
      normalizedTranscript,
    ) ||
    /(ajuda|help|socorro).*(voz|comandos|assistente)?/.test(
      normalizedTranscript,
    ) ||
    /(abrir|mostrar|ver).*(ajuda|comandos de voz)/.test(normalizedTranscript)
  );
}

function isRepeatPageGuidanceCommand(normalizedTranscript: string): boolean {
  return (
    /^(repetir|repita)\s+(instrucoes|instrutcoes|orientacoes|resumo)$/.test(
      normalizedTranscript,
    ) ||
    /(repetir|repita|ouvir|ler).*(instrucoes|instrutcoes|orientacoes|resumo).*(pagina|tela)/.test(
      normalizedTranscript,
    ) ||
    /^(instrucoes|instrutcoes|orientacoes|resumo).*(pagina|tela)$/.test(
      normalizedTranscript,
    ) ||
    /^(ler|ouvir).*(instrucoes|instrutcoes|orientacoes)$/.test(
      normalizedTranscript,
    )
  );
}

function isReplayVoiceOnboardingCommand(normalizedTranscript: string): boolean {
  return /^ouvir novamente$/.test(normalizedTranscript);
}

function isCompleteVoiceOnboardingCommand(
  normalizedTranscript: string,
): boolean {
  return /^concluir(\s+a)?\s+apresentacao$/.test(normalizedTranscript);
}

function isSkipVoiceOnboardingCommand(normalizedTranscript: string): boolean {
  return /^(pular|pular por agora)$/.test(normalizedTranscript);
}

function isCloseModalCommand(normalizedTranscript: string): boolean {
  return (
    /^(fechar|fechar modal|fechar ajuda|fechar pedido|cancelar)$/.test(
      normalizedTranscript,
    ) ||
    /(fechar|cancelar).*(modal|janela|ajuda|pedido)/.test(normalizedTranscript)
  );
}

function isLogoutCommand(normalizedTranscript: string): boolean {
  return (
    /(deslogar|deslogue|logout|logoff)/.test(normalizedTranscript) ||
    /(faca|faça|efetue).*(logout|logoff)/.test(normalizedTranscript) ||
    /(saia|sair|quero sair).*(do sistema|da conta|da aplicacao|do aplicativo|do app)/.test(
      normalizedTranscript,
    ) ||
    /(encerrar|encerre|terminar|termine|fechar|feche).*(sessao|sessao atual)/.test(
      normalizedTranscript,
    )
  );
}

function isOpenHomeCommand(normalizedTranscript: string): boolean {
  return (
    /(abrir|ir|mostrar|voltar|retornar).*(home|inicio)/.test(
      normalizedTranscript,
    ) ||
    /(voltar|retornar).*(pagina inicial|tela inicial)/.test(
      normalizedTranscript,
    ) ||
    /(ir|abrir|mostrar).*(pagina inicial|tela inicial)/.test(
      normalizedTranscript,
    )
  );
}

function isSelectBookCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (currentRoute !== "/books") {
    return false;
  }

  return (
    /^(?:selecionar|escolher|quero|abrir|escolhi|escolha)\s+(?:o\s+)?(?:livro\s+)?(.+)/.test(
      normalizedTranscript,
    ) || /(?:esse|aquele|este)\s+(?:livro|aqui)/.test(normalizedTranscript)
  );
}

function isOpenCartCommand(normalizedTranscript: string): boolean {
  return (
    /(abrir|abra|ver|veja|mostrar|mostre).*(carrinho)/.test(
      normalizedTranscript,
    ) ||
    /(voltar|retornar).*(ao|para o)?\s*carrinho/.test(normalizedTranscript) ||
    /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*carrinho/.test(
      normalizedTranscript,
    )
  );
}

function isOpenBooksCommand(normalizedTranscript: string): boolean {
  return (
    /^(?:eu\s+)?(?:vou\s+|quero\s+)?continuar comprando$/.test(
      normalizedTranscript,
    ) ||
    /(abrir|abra|ver|veja|mostrar|mostre|listar|liste)\s*(livros?|catalogo(?:\s+de\s+livros)?)/.test(
      normalizedTranscript,
    ) ||
    /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*(livros?|catalogo(?:\s+de\s+livros)?)/.test(
      normalizedTranscript,
    )
  );
}

function isOpenBooksCommandPartial(normalizedTranscript: string): boolean {
  return /^(abrir|abra|ver|veja)$/.test(normalizedTranscript);
}

function isClearCartCommand(normalizedTranscript: string): boolean {
  return /(limpar|esvaziar|zerar).*(carrinho)/.test(normalizedTranscript);
}

function isRemoveCartItemCommand(normalizedTranscript: string): boolean {
  return (
    /^(remover|remova|tirar|tire|excluir|apagar)$/.test(normalizedTranscript) ||
    /(remover|remova|tirar|tire|excluir|apagar).*(item|ultimo|ultima|carrinho)/.test(
      normalizedTranscript,
    )
  );
}

function isReadCartItemsCountCommand(normalizedTranscript: string): boolean {
  return (
    /(quantos?|quantidade|total).*(itens?|livros?).*(carrinho)/.test(
      normalizedTranscript,
    ) ||
    /(carrinho).*(quantos?|quantidade|total).*(itens?|livros?)/.test(
      normalizedTranscript,
    ) ||
    /^(quantos?\s+itens?|quantidade\s+de\s+itens?|total\s+de\s+itens?)$/.test(
      normalizedTranscript,
    )
  );
}

function isReadCartItemsCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  const isShortCartAliasInCartRoute =
    currentRoute === "/cart" &&
    (/^(ler|leia|ouvir|listar|liste)\s+(os\s+)?itens$/.test(
      normalizedTranscript,
    ) ||
      /^(itens|itens no carrinho|itens do carrinho)$/.test(
        normalizedTranscript,
      ));

  return (
    isShortCartAliasInCartRoute ||
    /(ler|leia|ouvir|listar|liste).*(itens?|livros?).*(carrinho)/.test(
      normalizedTranscript,
    ) ||
    /(carrinho).*(ler|leia|ouvir|listar|liste).*(itens?|livros?)/.test(
      normalizedTranscript,
    ) ||
    /(quais|quais sao).*(itens?|livros?).*(carrinho)/.test(normalizedTranscript)
  );
}

function isReadCartTotalCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (/(itens?|livros?|quantidade)/.test(normalizedTranscript)) {
    return false;
  }

  return (
    /(informe|informar|diga|fale|mostrar|mostre|qual).*(total).*(carrinho)/.test(
      normalizedTranscript,
    ) ||
    /(total).*(carrinho)/.test(normalizedTranscript) ||
    /(carrinho).*(total)/.test(normalizedTranscript) ||
    (currentRoute === "/cart" &&
      /^(qual o total|total|informe o total)$/.test(normalizedTranscript))
  );
}

function isReadSearchResultsCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (currentRoute !== "/books") {
    return false;
  }

  return (
    /^(ler|leia|ouvir|mostrar|mostre|listar|liste)\s+(os\s+)?livros?\s+disponiveis$/.test(
      normalizedTranscript,
    ) ||
    /^livros?\s+disponiveis$/.test(normalizedTranscript) ||
    /(ler|leia|ouvir|fale|diga).*(resultados?|titulos?|livros? encontrados?)/.test(
      normalizedTranscript,
    ) ||
    /(quais|quais sao).*(resultados?|titulos?)/.test(normalizedTranscript) ||
    /(quais|quais sao).*(livros?).*(foram\s+)?encontrados?/.test(
      normalizedTranscript,
    ) ||
    /^(resultados?|titulos?)$/.test(normalizedTranscript)
  );
}

function isReadNextSearchResultsCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (currentRoute !== "/books") {
    return false;
  }

  return (
    /(ler|leia|ouvir)?\s*(os\s+)?(proximos|seguintes)\s*(resultados?|livros?|titulos?)/.test(
      normalizedTranscript,
    ) ||
    /(mais\s+resultados?|continuar\s+resultados?)/.test(normalizedTranscript)
  );
}

function isReadPreviousSearchResultsCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (currentRoute !== "/books") {
    return false;
  }

  return (
    /(ler|leia|ouvir)?\s*(os\s+)?(resultados?|livros?|titulos?)\s*(anteriores|passados)/.test(
      normalizedTranscript,
    ) ||
    /(voltar|retornar).*(resultados?|livros?|titulos?)/.test(
      normalizedTranscript,
    )
  );
}

function isRepeatSearchResultsCommand(
  normalizedTranscript: string,
  currentRoute: string,
): boolean {
  if (currentRoute !== "/books") {
    return false;
  }

  return (
    /(repetir|repita).*(resultados?|livros?|titulos?|bloco)/.test(
      normalizedTranscript,
    ) ||
    /(ler|ouvir).*(novamente).*(resultados?|livros?|titulos?|bloco)/.test(
      normalizedTranscript,
    )
  );
}

export function parseVoiceIntent(
  transcript: string,
  options: ParseVoiceIntentOptions = {},
): ParsedIntent {
  const { currentRoute = "/" } = options;
  const normalizedTranscript = normalizeText(transcript);

  if (!normalizedTranscript) {
    return {
      intent: VOICE_INTENTS.UNKNOWN,
      entity: null,
      confidence: 0,
      transcript: "",
    };
  }

  if (isReplayVoiceOnboardingCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.REPLAY_VOICE_ONBOARDING,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (isCompleteVoiceOnboardingCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.COMPLETE_VOICE_ONBOARDING,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (isSkipVoiceOnboardingCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.SKIP_VOICE_ONBOARDING,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(adicionar|adicione|comprar|compre|quero comprar).*(carrinho)?/.test(
      normalizedTranscript,
    )
  ) {
    return {
      intent: VOICE_INTENTS.ADD_TO_CART,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  const removeBookEntity = extractRemoveBookEntity(normalizedTranscript);
  if (removeBookEntity) {
    return {
      intent: VOICE_INTENTS.REMOVE_BOOK_FROM_CART,
      entity: removeBookEntity,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (isClearCartCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.CLEAR_CART,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (isReadCartItemsCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.READ_CART_ITEMS,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isReadCartTotalCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.READ_CART_TOTAL,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isReadCartItemsCountCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.READ_CART_ITEMS_COUNT,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isRemoveCartItemCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.REMOVE_CART_ITEM,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (isOpenCartCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_CART,
      entity: null,
      confidence: 0.94,
      transcript: normalizedTranscript,
    };
  }

  if (isOpenBooksCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_BOOKS,
      entity: null,
      confidence: 0.91,
      transcript: normalizedTranscript,
    };
  }

  if (
    isOpenBooksCommandPartial(normalizedTranscript) &&
    /\/(home)?$/.test(currentRoute)
  ) {
    return {
      intent: VOICE_INTENTS.OPEN_BOOKS,
      entity: null,
      confidence: 0.85,
      transcript: normalizedTranscript,
    };
  }

  if (isCloseModalCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.CLOSE_MODAL,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (
    /^(confirmar|ok|sim|prosseguir|continuar|aprovar)$/.test(
      normalizedTranscript,
    ) &&
    currentRoute === "/cart"
  ) {
    return {
      intent: VOICE_INTENTS.CONFIRM_CHECKOUT,
      entity: null,
      confidence: 0.95,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(finalizar|concluir|fechar).*(compra|pedido)|(?:abrir|ir|mostrar).*(pedidos)|^pedidos$/.test(
      normalizedTranscript,
    )
  ) {
    return {
      intent: VOICE_INTENTS.CHECKOUT,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isRepeatPageGuidanceCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.REPEAT_PAGE_GUIDANCE,
      entity: null,
      confidence: 0.93,
      transcript: normalizedTranscript,
    };
  }

  if (isVoiceHelpCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_VOICE_HELP,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isLogoutCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.LOGOUT,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isNextOrderCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_NEXT_ORDER,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (isPreviousOrderCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_PREVIOUS_ORDER,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (
    /^(ler|leia|ouvir)\s+(o\s+)?titulo$/.test(normalizedTranscript) ||
    /^qual\s+o\s+titulo$/.test(normalizedTranscript) ||
    /^qual\s+e\s+o\s+titulo$/.test(normalizedTranscript)
  ) {
    return {
      intent: VOICE_INTENTS.READ_TITLE,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(ler|leia).*(descricao|sinopse|detalhes)/.test(normalizedTranscript) ||
    /^(descricao|detalhes)$/.test(normalizedTranscript)
  ) {
    return {
      intent: VOICE_INTENTS.READ_DESCRIPTION,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isReadNextSearchResultsCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.READ_NEXT_SEARCH_RESULTS,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isReadPreviousSearchResultsCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.READ_PREVIOUS_SEARCH_RESULTS,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isRepeatSearchResultsCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.REPEAT_SEARCH_RESULTS,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isReadSearchResultsCommand(normalizedTranscript, currentRoute)) {
    return {
      intent: VOICE_INTENTS.READ_SEARCH_RESULTS,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (isOpenHomeCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_HOME,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (/(voltar|pagina anterior|retornar)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.GO_BACK,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  const orderNumber = extractOrderNumber(normalizedTranscript);
  if (orderNumber) {
    return {
      intent: VOICE_INTENTS.OPEN_ORDER,
      entity: orderNumber,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(ler|leia|ouvir).*(pedido|dados do pedido|detalhes do pedido)/.test(
      normalizedTranscript,
    )
  ) {
    return {
      intent: VOICE_INTENTS.READ_ORDER_DETAILS,
      entity: extractOrderNumberFromReadCommand(normalizedTranscript),
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  const selectBookEntity = extractSelectBookEntity(normalizedTranscript);
  if (
    isSelectBookCommand(normalizedTranscript, currentRoute) &&
    selectBookEntity
  ) {
    return {
      intent: VOICE_INTENTS.SELECT_BOOK,
      entity: selectBookEntity,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  const detailsEntity = extractBookDetailsEntity(normalizedTranscript);
  if (detailsEntity) {
    return {
      intent: VOICE_INTENTS.OPEN_BOOK_DETAILS,
      entity: detailsEntity,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (
    includesAny(normalizedTranscript, SEARCH_VERBS) ||
    normalizedTranscript.includes("livro")
  ) {
    const entity = extractSearchEntity(normalizedTranscript);

    if (entity) {
      return {
        intent: VOICE_INTENTS.SEARCH_BOOK,
        entity,
        confidence: 0.9,
        transcript: normalizedTranscript,
      };
    }
  }

  return {
    intent: VOICE_INTENTS.UNKNOWN,
    entity: null,
    confidence: 0.3,
    transcript: normalizedTranscript,
  };
}
