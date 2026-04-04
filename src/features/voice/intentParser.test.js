import { describe, expect, it } from "vitest";
import { parseVoiceIntent, VOICE_INTENTS } from "./intentParser.js";

describe("parseVoiceIntent core commands", () => {
  it("recognizes open books commands", () => {
    const cases = [
      "abrir livros",
      "mostrar catalogo",
      "listar livros",
      "ir para livros",
      "ir para o catalogo",
      "quero ir para livros",
      "acessar o catalogo de livros",
      "me leve para os livros",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    });
  });

  it("recognizes open cart commands", () => {
    const cases = [
      "abrir carrinho",
      "mostrar carrinho",
      "ver o carrinho",
      "ir para carrinho",
      "ir para o carrinho",
      "quero ir para o carrinho",
      "acessar o carrinho",
      "me leve para o carrinho",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_CART);
    });
  });

  it("recognizes checkout commands", () => {
    const cases = ["finalizar compra", "concluir pedido", "ir para checkout"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.CHECKOUT);
    });
  });

  it("recognizes open home commands", () => {
    const cases = ["ir para inicio", "mostrar home"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_HOME);
    });
  });

  it("recognizes voice help commands", () => {
    const cases = [
      "me ajude",
      "me ajuda",
      "pode me ajudar",
      "help",
      "preciso de ajuda",
      "quero ajuda",
      "abrir ajuda",
      "mostrar ajuda de voz",
      "comandos de voz",
      "ajuda de voz",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_VOICE_HELP);
    });
  });

  it("recognizes close modal commands", () => {
    const cases = [
      "fechar",
      "fechar modal",
      "fechar ajuda",
      "fechar pedido",
      "cancelar modal",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.CLOSE_MODAL);
    });
  });

  it("recognizes logout commands", () => {
    const cases = [
      "deslogar",
      "deslogue",
      "faca logout",
      "efetue logout",
      "saia do sistema",
      "logout",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.LOGOUT);
    });
  });

  it("recognizes read description commands", () => {
    const cases = ["ler descricao", "ouvir a sinopse"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.READ_DESCRIPTION);
    });
  });

  it("recognizes add to cart commands", () => {
    const cases = [
      "adicionar ao carrinho",
      "quero comprar",
      "compre esse livro",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.ADD_TO_CART);
    });
  });

  it("recognizes clear cart commands", () => {
    const cases = ["limpar carrinho", "esvaziar carrinho", "zerar carrinho"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.CLEAR_CART);
    });
  });

  it("recognizes read cart items count commands", () => {
    const cases = [
      "quantos itens ha no carrinho",
      "qual a quantidade de itens no carrinho",
      "total de itens do carrinho",
      "quantos itens",
      "quantidade de itens",
      "total de itens",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.READ_CART_ITEMS_COUNT);
    });
  });

  it("recognizes remove last cart item commands", () => {
    const cases = ["remover", "tirar item do carrinho", "remover ultimo item"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.REMOVE_CART_ITEM);
    });
  });

  it("recognizes remove specific book from cart command", () => {
    const result = parseVoiceIntent("remover livro clean code");
    expect(result.intent).toBe(VOICE_INTENTS.REMOVE_BOOK_FROM_CART);
    expect(result.entity).toBe("clean code");
  });

  it("recognizes short remove specific book command", () => {
    const result = parseVoiceIntent("remover clean code");
    expect(result.intent).toBe(VOICE_INTENTS.REMOVE_BOOK_FROM_CART);
    expect(result.entity).toBe("clean code");
  });

  it("recognizes search commands and extracts entity", () => {
    const result = parseVoiceIntent("buscar livro javascript moderno");
    expect(result.intent).toBe(VOICE_INTENTS.SEARCH_BOOK);
    expect(result.entity).toBe("javascript moderno");
  });

  it("recognizes detail command and extracts book entity", () => {
    const result = parseVoiceIntent("abrir detalhes de clean code");
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOK_DETAILS);
    expect(result.entity).toBe("clean code");
  });

  it("handles accents and punctuation for navigation commands", () => {
    const result = parseVoiceIntent("Próximo pedido, por favor!");
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_NEXT_ORDER);
  });

  it("returns unknown for unsupported text", () => {
    const result = parseVoiceIntent("tempo hoje em porto alegre");
    expect(result.intent).toBe(VOICE_INTENTS.UNKNOWN);
  });

  it("returns unknown for empty transcript", () => {
    const result = parseVoiceIntent("   ");
    expect(result.intent).toBe(VOICE_INTENTS.UNKNOWN);
    expect(result.confidence).toBe(0);
  });
});

describe("parseVoiceIntent order navigation", () => {
  it("recognizes next order command variants", () => {
    const cases = [
      "proximo pedido",
      "pedido seguinte",
      "ir para o proximo pedido",
      "mostrar proxima compra",
      "pedido prossimo",
      "pedido proxmo",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_NEXT_ORDER);
    });
  });

  it("recognizes previous order command variants", () => {
    const cases = [
      "pedido anterior",
      "pedido passado",
      "pedido de antes",
      "voltar para pedido anterior",
      "retornar pedido atras",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_PREVIOUS_ORDER);
    });
  });

  it("keeps generic go back when no order context is present", () => {
    const result = parseVoiceIntent("voltar para pagina anterior");
    expect(result.intent).toBe(VOICE_INTENTS.GO_BACK);
  });

  it("parses explicit order number command", () => {
    const result = parseVoiceIntent("abrir pedido numero 12");
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_ORDER);
    expect(result.entity).toBe("12");
  });

  it("parses read order details command with explicit order number", () => {
    const result = parseVoiceIntent("ler dados do pedido 8");
    expect(result.intent).toBe(VOICE_INTENTS.READ_ORDER_DETAILS);
    expect(result.entity).toBe("8");
  });
});
