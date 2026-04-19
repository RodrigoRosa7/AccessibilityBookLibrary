import { describe, expect, it, vi } from "vitest";
import { parseVoiceIntent, VOICE_INTENTS } from "./intentParser.js";
import { handleVoiceCommand } from "./voiceCommands.js";

describe("pedidos voice navigation flow", () => {
  it("dispatches onboarding modal actions", () => {
    const replayVoiceOnboarding = vi.fn();
    const completeVoiceOnboarding = vi.fn();
    const skipVoiceOnboarding = vi.fn();

    handleVoiceCommand(
      { intent: VOICE_INTENTS.REPLAY_VOICE_ONBOARDING, entity: null },
      { replayVoiceOnboarding },
    );
    handleVoiceCommand(
      { intent: VOICE_INTENTS.COMPLETE_VOICE_ONBOARDING, entity: null },
      { completeVoiceOnboarding },
    );
    handleVoiceCommand(
      { intent: VOICE_INTENTS.SKIP_VOICE_ONBOARDING, entity: null },
      { skipVoiceOnboarding },
    );

    expect(replayVoiceOnboarding).toHaveBeenCalledTimes(1);
    expect(completeVoiceOnboarding).toHaveBeenCalledTimes(1);
    expect(skipVoiceOnboarding).toHaveBeenCalledTimes(1);
  });

  it("navigates to books when user says pedidos continue shopping command", () => {
    const openBooks = vi.fn();
    const openCart = vi.fn();
    const intent = parseVoiceIntent("vou continuar comprando", {
      currentRoute: "/checkout",
    });

    const message = handleVoiceCommand(intent, { openBooks, openCart });

    expect(intent.intent).toBe("OPEN_BOOKS");
    expect(openBooks).toHaveBeenCalledTimes(1);
    expect(openCart).not.toHaveBeenCalled();
    expect(message).toBe("Abrindo catálogo de livros.");
  });

  it("navigates to cart when user says pedidos back to cart command", () => {
    const openBooks = vi.fn();
    const openCart = vi.fn();
    const intent = parseVoiceIntent("voltar ao carrinho", {
      currentRoute: "/checkout",
    });

    const message = handleVoiceCommand(intent, { openBooks, openCart });

    expect(intent.intent).toBe("OPEN_CART");
    expect(openCart).toHaveBeenCalledTimes(1);
    expect(openBooks).not.toHaveBeenCalled();
    expect(message).toBe("Abrindo carrinho.");
  });

  it("confirms checkout when user says confirm in cart route", () => {
    const confirmCheckout = vi.fn();
    const intent = parseVoiceIntent("confirmar", {
      currentRoute: "/cart",
    });

    const message = handleVoiceCommand(intent, { confirmCheckout });

    expect(intent.intent).toBe(VOICE_INTENTS.CONFIRM_CHECKOUT);
    expect(confirmCheckout).toHaveBeenCalledTimes(1);
    expect(message).toBe("");
  });

  it("dispatches read search results action on books route", () => {
    const readSearchResults = vi.fn();
    const intent = parseVoiceIntent("ler resultados da busca", {
      currentRoute: "/books",
    });

    const message = handleVoiceCommand(intent, { readSearchResults });

    expect(intent.intent).toBe(VOICE_INTENTS.READ_SEARCH_RESULTS);
    expect(readSearchResults).toHaveBeenCalledTimes(1);
    expect(message).toBe("");
  });

  it("dispatches next, previous and repeat search actions on books route", () => {
    const readNextSearchResults = vi.fn();
    const readPreviousSearchResults = vi.fn();
    const repeatSearchResults = vi.fn();

    const nextIntent = parseVoiceIntent("ler proximos resultados", {
      currentRoute: "/books",
    });
    const previousIntent = parseVoiceIntent("ler resultados anteriores", {
      currentRoute: "/books",
    });
    const repeatIntent = parseVoiceIntent("repetir resultados", {
      currentRoute: "/books",
    });

    handleVoiceCommand(nextIntent, { readNextSearchResults });
    handleVoiceCommand(previousIntent, { readPreviousSearchResults });
    handleVoiceCommand(repeatIntent, { repeatSearchResults });

    expect(readNextSearchResults).toHaveBeenCalledTimes(1);
    expect(readPreviousSearchResults).toHaveBeenCalledTimes(1);
    expect(repeatSearchResults).toHaveBeenCalledTimes(1);
  });

  it("dispatches select book action with entity on books route", () => {
    const selectBook = vi.fn();
    const intent = parseVoiceIntent("selecionar clean code", {
      currentRoute: "/books",
    });

    const message = handleVoiceCommand(intent, { selectBook });

    expect(intent.intent).toBe(VOICE_INTENTS.SELECT_BOOK);
    expect(intent.entity).toBe("clean code");
    expect(selectBook).toHaveBeenCalledWith("clean code");
    expect(selectBook).toHaveBeenCalledTimes(1);
    expect(message).toBe("Selecionando clean code.");
  });

  it("returns error message for select book without entity", () => {
    const selectBook = vi.fn();
    const message = handleVoiceCommand(
      { intent: VOICE_INTENTS.SELECT_BOOK, entity: null },
      { selectBook },
    );

    expect(selectBook).not.toHaveBeenCalled();
    expect(message).toBe("Não entendi qual livro você quer selecionar.");
  });

  it("dispatches read cart items action", () => {
    const readCartItems = vi.fn();
    const intent = parseVoiceIntent("ler itens do carrinho", {
      currentRoute: "/cart",
    });

    const message = handleVoiceCommand(intent, { readCartItems });

    expect(intent.intent).toBe(VOICE_INTENTS.READ_CART_ITEMS);
    expect(readCartItems).toHaveBeenCalledTimes(1);
    expect(message).toBe("");
  });

  it("dispatches read cart total action", () => {
    const readCartTotal = vi.fn();
    const intent = parseVoiceIntent("total do carrinho", {
      currentRoute: "/cart",
    });

    const message = handleVoiceCommand(intent, { readCartTotal });

    expect(intent.intent).toBe(VOICE_INTENTS.READ_CART_TOTAL);
    expect(readCartTotal).toHaveBeenCalledTimes(1);
    expect(message).toBe("");
  });

  it("dispatches read title action", () => {
    const readTitle = vi.fn();
    const intent = parseVoiceIntent("ler título", {
      currentRoute: "/books/1",
    });

    const message = handleVoiceCommand(intent, { readTitle });

    expect(intent.intent).toBe(VOICE_INTENTS.READ_TITLE);
    expect(readTitle).toHaveBeenCalledTimes(1);
    expect(message).toBe("");
  });
});
