import { describe, expect, it, vi } from "vitest";
import { parseVoiceIntent, VOICE_INTENTS } from "./intentParser.js";
import { handleVoiceCommand } from "./voiceCommands.js";

describe("checkout voice navigation flow", () => {
  it("navigates to books when user says checkout continue shopping command", () => {
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

  it("navigates to cart when user says checkout back to cart command", () => {
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
});
