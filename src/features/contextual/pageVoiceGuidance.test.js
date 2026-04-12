import { describe, expect, it } from "vitest";
import { getPageVoiceGuidance } from "./pageVoiceGuidance.js";

describe("getPageVoiceGuidance", () => {
  it("returns catalog guidance for books route", () => {
    const guidance = getPageVoiceGuidance("/books");

    expect(guidance.title).toContain("catálogo");
    expect(guidance.commands).toContain("ler resultados da busca");
    expect(guidance.speechText).toContain("repetir instruções da página");
  });

  it("returns details guidance for dynamic book route", () => {
    const guidance = getPageVoiceGuidance("/books/10");

    expect(guidance.title).toContain("detalhes");
    expect(guidance.commands).toContain("ler descrição");
  });

  it("returns checkout guidance with contextual summary for first session playback", () => {
    const guidance = getPageVoiceGuidance("/checkout");

    expect(guidance.title).toContain("pedidos");
    expect(guidance.commands).toContain("ler dados do pedido");
    expect(guidance.speechText).toContain("Você está na área de pedidos");
    expect(guidance.speechText).toContain("repetir instruções");
  });
});
