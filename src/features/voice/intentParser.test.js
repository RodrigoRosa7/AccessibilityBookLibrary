import { describe, expect, it } from "vitest";
import { parseVoiceIntent, VOICE_INTENTS } from "./intentParser";

describe("parseVoiceIntent core commands", () => {
  it("recognizes onboarding presentation voice commands", () => {
    const replay = parseVoiceIntent("ouvir novamente");
    const complete = parseVoiceIntent("concluir apresentação");
    const completeWithArticle = parseVoiceIntent("concluir a apresentação");
    const skip = parseVoiceIntent("pular por agora");
    const skipShort = parseVoiceIntent("pular");

    expect(replay.intent).toBe(VOICE_INTENTS.REPLAY_VOICE_ONBOARDING);
    expect(complete.intent).toBe(VOICE_INTENTS.COMPLETE_VOICE_ONBOARDING);
    expect(completeWithArticle.intent).toBe(
      VOICE_INTENTS.COMPLETE_VOICE_ONBOARDING,
    );
    expect(skip.intent).toBe(VOICE_INTENTS.SKIP_VOICE_ONBOARDING);
    expect(skipShort.intent).toBe(VOICE_INTENTS.SKIP_VOICE_ONBOARDING);
  });

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
      "continuar comprando",
      "vou continuar comprando",
      "quero continuar comprando",
      "eu quero continuar comprando",
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
      "voltar ao carrinho",
      "retornar para o carrinho",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.OPEN_CART);
    });
  });

  it("recognizes pedidos commands", () => {
    const cases = ["finalizar compra", "concluir pedido", "ir para pedidos"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.CHECKOUT);
    });
  });

  it("recognizes confirm checkout commands in cart route", () => {
    const cases = [
      "confirmar",
      "ok",
      "sim",
      "prosseguir",
      "continuar",
      "aprovar",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/cart" });
      expect(result.intent).toBe(VOICE_INTENTS.CONFIRM_CHECKOUT);
    });
  });

  it("does not recognize confirm as confirm checkout outside cart route", () => {
    const cases = ["confirmar", "ok", "sim"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, {
        currentRoute: "/checkout",
      });
      expect(result.intent).not.toBe(VOICE_INTENTS.CONFIRM_CHECKOUT);
    });
  });

  it("recognizes open home commands", () => {
    const cases = [
      "ir para inicio",
      "mostrar home",
      "abrir inicio",
      "voltar para inicio",
      "voltar para pagina inicial",
      "retornar para tela inicial",
    ];

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

  it("recognizes repeat page guidance commands", () => {
    const cases = [
      "repetir instruções",
      "repetir instruções da página",
      "ler instruções",
      "ouvir instruções",
      "instruções da página",
      "ouvir orientações da tela",
      "repita o resumo da página",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.REPEAT_PAGE_GUIDANCE);
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
      "sair do sistema",
      "sair da conta",
      "encerrar sessao",
      "termine a sessao atual",
      "logoff",
      "logout",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.LOGOUT);
    });
  });

  it("recognizes read description commands", () => {
    const cases = [
      "ler descricao",
      "ler sinopse",
      "ler detalhes",
      "detalhes",
      "descricao",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.READ_DESCRIPTION);
    });
  });

  it("recognizes read title commands", () => {
    const cases = ["ler título", "qual o título"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.READ_TITLE);
    });
  });

  it("recognizes read price commands", () => {
    const cases = ["preço", "ler preço", "qual o preço", "falar custo"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, {
        currentRoute: "/books/1",
      });
      expect(result.intent).toBe(VOICE_INTENTS.READ_PRICE);
    });
  });

  it("does not classify cart value phrases as read price", () => {
    const cartPhrases = ["qual o valor do carrinho", "valor do carrinho"];

    cartPhrases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).not.toBe(VOICE_INTENTS.READ_PRICE);
    });
  });

  it("recognizes read search results commands on books route", () => {
    const cases = [
      "ler resultados da busca",
      "ler titulos dos livros",
      "quais livros foram encontrados",
      "ler livros disponíveis",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/books" });
      expect(result.intent).toBe(VOICE_INTENTS.READ_SEARCH_RESULTS);
    });
  });

  it("recognizes next search results commands on books route", () => {
    const cases = [
      "ler proximos resultados",
      "proximos resultados",
      "mais resultados",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/books" });
      expect(result.intent).toBe(VOICE_INTENTS.READ_NEXT_SEARCH_RESULTS);
    });
  });

  it("recognizes previous search results commands on books route", () => {
    const cases = [
      "ler resultados anteriores",
      "resultados anteriores",
      "voltar resultados",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/books" });
      expect(result.intent).toBe(VOICE_INTENTS.READ_PREVIOUS_SEARCH_RESULTS);
    });
  });

  it("recognizes repeat search results commands on books route", () => {
    const cases = [
      "repetir resultados",
      "repita os resultados",
      "ler novamente os resultados",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/books" });
      expect(result.intent).toBe(VOICE_INTENTS.REPEAT_SEARCH_RESULTS);
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

  it("recognizes read cart items commands", () => {
    const cases = [
      "ler itens do carrinho",
      "ler itens",
      "itens",
      "itens no carrinho",
      "itens do carrinho",
      "listar itens do carrinho",
      "quais livros estao no carrinho",
      "quais itens estão no carrinho",
      "ouvir itens do carrinho",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/cart" });
      expect(result.intent).toBe(VOICE_INTENTS.READ_CART_ITEMS);
    });
  });

  it("recognizes read cart total commands", () => {
    const cases = [
      "informe o total do carrinho",
      "total do carrinho",
      "qual o total do carrinho",
    ];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.READ_CART_TOTAL);
    });

    const shortCases = ["qual o total", "informe o total"];
    shortCases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/cart" });
      expect(result.intent).toBe(VOICE_INTENTS.READ_CART_TOTAL);
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

  it("does not classify pedidos continue shopping command as search", () => {
    const result = parseVoiceIntent("quero continuar comprando", {
      currentRoute: "/checkout",
    });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    expect(result.entity).toBe(null);
  });

  it("still recognizes search with explicit livro after quero", () => {
    const result = parseVoiceIntent("quero o livro clean code");
    expect(result.intent).toBe(VOICE_INTENTS.SEARCH_BOOK);
    expect(result.entity).toBe("clean code");
  });

  it("recognizes detail command and extracts book entity", () => {
    const result = parseVoiceIntent("abrir detalhes de clean code");
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOK_DETAILS);
    expect(result.entity).toBe("clean code");
  });

  it("recognizes select book commands with entity when on /books route", () => {
    const cases = [
      { transcript: "selecionar clean code", entity: "clean code" },
      {
        transcript: "escolher javascript moderno",
        entity: "javascript moderno",
      },
      { transcript: "quero dom casmurro", entity: "dom casmurro" },
      { transcript: "abrir 1984", entity: "1984" },
      { transcript: "escolhi fundacao", entity: "fundacao" },
      { transcript: "escolha o livro macunaima", entity: "macunaima" },
    ];

    cases.forEach(({ transcript, entity }) => {
      const result = parseVoiceIntent(transcript, { currentRoute: "/books" });
      expect(result.intent).toBe(VOICE_INTENTS.SELECT_BOOK);
      expect(result.entity).toBe(entity);
    });
  });

  it("does not recognize select book commands outside /books route", () => {
    const result = parseVoiceIntent("selecionar clean code", {
      currentRoute: "/",
    });
    expect(result.intent).not.toBe(VOICE_INTENTS.SELECT_BOOK);
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

  it("recognizes speech rate commands and extracts the multiplier", () => {
    const cases = [
      { transcript: "velocidade 2 vezes", entity: "2" },
      { transcript: "velocidade 2x", entity: "2" },
      { transcript: "aumentar velocidade 3 vezes", entity: "3" },
      { transcript: "alterar velocidade para 1", entity: "1" },
      { transcript: "mudar velocidade em 2", entity: "2" },
      { transcript: "definir velocidade de 3", entity: "3" },
      { transcript: "velocidade 5 vezes", entity: "5" },
    ];

    cases.forEach(({ transcript, entity }) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).toBe(VOICE_INTENTS.SET_SPEECH_RATE);
      expect(result.entity).toBe(entity);
    });
  });

  it("does not classify unrelated phrases as speech rate", () => {
    const cases = ["velocidade", "velocidade alta", "muito rápido"];

    cases.forEach((transcript) => {
      const result = parseVoiceIntent(transcript);
      expect(result.intent).not.toBe(VOICE_INTENTS.SET_SPEECH_RATE);
    });
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

describe("parseVoiceIntent partial recognition", () => {
  it("recognizes 'abrir' alone as OPEN_BOOKS when on home route", () => {
    const result = parseVoiceIntent("abrir", { currentRoute: "/home" });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    expect(result.confidence).toBe(0.85);
  });

  it("recognizes 'abra' alone as OPEN_BOOKS when on root route", () => {
    const result = parseVoiceIntent("abra", { currentRoute: "/" });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    expect(result.confidence).toBe(0.85);
  });

  it("recognizes 'ver' alone as OPEN_BOOKS when on home route", () => {
    const result = parseVoiceIntent("ver", { currentRoute: "/home" });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    expect(result.confidence).toBe(0.85);
  });

  it("recognizes 'veja' alone as OPEN_BOOKS when on root route", () => {
    const result = parseVoiceIntent("veja", { currentRoute: "/" });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
    expect(result.confidence).toBe(0.85);
  });

  it("does not treat 'abrir' as OPEN_BOOKS when not on home route", () => {
    const result = parseVoiceIntent("abrir", { currentRoute: "/books" });
    expect(result.intent).not.toBe(VOICE_INTENTS.OPEN_BOOKS);
  });

  it("recognizes 'abrir livro' on any route as explicit OPEN_BOOKS", () => {
    const result = parseVoiceIntent("abrir livro", {
      currentRoute: "/books/123",
    });
    expect(result.intent).toBe(VOICE_INTENTS.OPEN_BOOKS);
  });

  it("does not read search results outside books route", () => {
    const result = parseVoiceIntent("ler resultados da busca", {
      currentRoute: "/checkout",
    });
    expect(result.intent).not.toBe(VOICE_INTENTS.READ_SEARCH_RESULTS);
  });

  it("does not paginate search results outside books route", () => {
    const result = parseVoiceIntent("ler proximos resultados", {
      currentRoute: "/checkout",
    });
    expect(result.intent).not.toBe(VOICE_INTENTS.READ_NEXT_SEARCH_RESULTS);
  });
});
