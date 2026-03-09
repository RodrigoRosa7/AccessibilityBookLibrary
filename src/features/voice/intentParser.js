export const VOICE_INTENTS = {
  SEARCH_BOOK: "SEARCH_BOOK",
  OPEN_BOOK_DETAILS: "OPEN_BOOK_DETAILS",
  OPEN_ORDER: "OPEN_ORDER",
  READ_ORDER_DETAILS: "READ_ORDER_DETAILS",
  OPEN_NEXT_ORDER: "OPEN_NEXT_ORDER",
  OPEN_PREVIOUS_ORDER: "OPEN_PREVIOUS_ORDER",
  ADD_TO_CART: "ADD_TO_CART",
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

  if (/(abrir|ver|mostrar).*(carrinho)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_CART,
      entity: null,
      confidence: 0.94,
      transcript: normalizedTranscript,
    };
  }

  if (
    /(abrir|ver|mostrar|listar).*(livros|catalogo)/.test(normalizedTranscript)
  ) {
    return {
      intent: VOICE_INTENTS.OPEN_BOOKS,
      entity: null,
      confidence: 0.91,
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

  if (
    /(proximo pedido|pedido proximo|pedido seguinte|seguinte pedido)/.test(
      normalizedTranscript,
    )
  ) {
    return {
      intent: VOICE_INTENTS.OPEN_NEXT_ORDER,
      entity: null,
      confidence: 0.9,
      transcript: normalizedTranscript,
    };
  }

  if (/(pedido anterior|anterior pedido|pedido passado)/.test(normalizedTranscript)) {
    return {
      intent: VOICE_INTENTS.OPEN_PREVIOUS_ORDER,
      entity: null,
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
