export const VOICE_INTENTS = {
  SEARCH_BOOK: "SEARCH_BOOK",
  OPEN_BOOK_DETAILS: "OPEN_BOOK_DETAILS",
  OPEN_VOICE_HELP: "OPEN_VOICE_HELP",
  CLOSE_MODAL: "CLOSE_MODAL",
  LOGOUT: "LOGOUT",
  OPEN_ORDER: "OPEN_ORDER",
  READ_ORDER_DETAILS: "READ_ORDER_DETAILS",
  OPEN_NEXT_ORDER: "OPEN_NEXT_ORDER",
  OPEN_PREVIOUS_ORDER: "OPEN_PREVIOUS_ORDER",
  ADD_TO_CART: "ADD_TO_CART",
  READ_CART_ITEMS_COUNT: "READ_CART_ITEMS_COUNT",
  CLEAR_CART: "CLEAR_CART",
  REMOVE_CART_ITEM: "REMOVE_CART_ITEM",
  REMOVE_BOOK_FROM_CART: "REMOVE_BOOK_FROM_CART",
  OPEN_CART: "OPEN_CART",
  OPEN_BOOKS: "OPEN_BOOKS",
  CHECKOUT: "CHECKOUT",
  GO_BACK: "GO_BACK",
  READ_DESCRIPTION: "READ_DESCRIPTION",
  OPEN_HOME: "OPEN_HOME",
  UNKNOWN: "UNKNOWN",
};

const SEARCH_VERBS = [
  "buscar",
  "busque",
  "procurar",
  "procure",
  "encontrar",
  "pesquisar",
  "quero",
  "mostrar",
  "ache",
];

function normalizeText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractSearchEntity(normalizedTranscript) {
  const patterns = [
    /(?:buscar|procurar|encontrar|pesquisar|mostrar)\s+(?:livro|livros)?\s*(.+)$/,
    /quero\s+(?:o\s+)?(?:livro\s+)?(.+)$/,
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

function extractBookDetailsEntity(normalizedTranscript) {
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

function extractRemoveBookEntity(normalizedTranscript) {
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

function extractOrderNumber(normalizedTranscript) {
  const match = normalizedTranscript.match(
    /(?:abrir|mostrar|ver)\s+(?:o\s+)?pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );

  return match?.[1] ?? null;
}

function extractOrderNumberFromReadCommand(normalizedTranscript) {
  const match = normalizedTranscript.match(
    /(?:ler|leia|ouvir)\s+.*pedido\s*(?:numero|n)?\s*#?\s*(\d+)/,
  );

  return match?.[1] ?? null;
}

function isNextOrderCommand(normalizedTranscript) {
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

function isPreviousOrderCommand(normalizedTranscript) {
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

function isVoiceHelpCommand(normalizedTranscript) {
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

function isCloseModalCommand(normalizedTranscript) {
  return (
    /^(fechar|fechar modal|fechar ajuda|fechar pedido|cancelar)$/.test(
      normalizedTranscript,
    ) ||
    /(fechar|cancelar).*(modal|janela|ajuda|pedido)/.test(normalizedTranscript)
  );
}

function isLogoutCommand(normalizedTranscript) {
  return (
    /(deslogar|deslogue|logout)/.test(normalizedTranscript) ||
    /(faca|faça|efetue).*(logout)/.test(normalizedTranscript) ||
    /(saia|sair).*(do sistema|da conta)/.test(normalizedTranscript)
  );
}

function isOpenCartCommand(normalizedTranscript) {
  return (
    /(abrir|abra|ver|veja|mostrar|mostre).*(carrinho)/.test(
      normalizedTranscript,
    ) ||
    /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*carrinho/.test(
      normalizedTranscript,
    )
  );
}

function isOpenBooksCommand(normalizedTranscript) {
  return (
    /(abrir|abra|ver|veja|mostrar|mostre|listar|liste).*(livros|catalogo(?:\s+de\s+livros)?)/.test(
      normalizedTranscript,
    ) ||
    /(?:(?:quero\s+)?(?:ir|va|vai|acessar|acesse|entrar|entre)|me leve).*(?:para\s+o|para\s+a|para|o|a)?\s*(livros|catalogo(?:\s+de\s+livros)?)/.test(
      normalizedTranscript,
    )
  );
}

function isClearCartCommand(normalizedTranscript) {
  return /(limpar|esvaziar|zerar).*(carrinho)/.test(normalizedTranscript);
}

function isRemoveCartItemCommand(normalizedTranscript) {
  return (
    /^(remover|remova|tirar|tire|excluir|apagar)$/.test(normalizedTranscript) ||
    /(remover|remova|tirar|tire|excluir|apagar).*(item|ultimo|ultima|carrinho)/.test(
      normalizedTranscript,
    )
  );
}

function isReadCartItemsCountCommand(normalizedTranscript) {
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

export function parseVoiceIntent(transcript) {
  const normalizedTranscript = normalizeText(transcript);

  if (!normalizedTranscript) {
    return {
      intent: VOICE_INTENTS.UNKNOWN,
      entity: null,
      confidence: 0,
      transcript: "",
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

  if (isCloseModalCommand(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.CLOSE_MODAL,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(finalizar|concluir|fechar).*(compra|pedido)|checkout/.test(
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

  if (/(voltar|pagina anterior|retornar)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.GO_BACK,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (/(ler|leia|ouvir).*(descricao|sinopse)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.READ_DESCRIPTION,
      entity: null,
      confidence: 0.92,
      transcript: normalizedTranscript,
    };
  }

  if (/(abrir|ir|mostrar).*(home|inicio)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_HOME,
      entity: null,
      confidence: 0.88,
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
