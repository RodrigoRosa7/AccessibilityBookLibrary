import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axe from "axe-core";
import { BooksPage } from "./BooksPage";
import { CartProvider } from "../app/providers/CartProvider";
vi.mock("../features/books/bookService", () => ({
  getBooks: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Dom Casmurro",
      author: "Machado de Assis",
      description: "Romance sobre memória, ciúme e dúvida na elite carioca do século dezenove.",
      price: 96,
    },
  ]),
}));

vi.mock("../features/voice/useSpeechSynthesis", () => ({
  useSpeechSynthesis: vi.fn().mockReturnValue({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

describe("BooksPage accessibility", () => {
  it("has no axe violations after books load", async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MemoryRouter initialEntries={["/books"]}>
          <CartProvider>
            <BooksPage />
          </CartProvider>
        </MemoryRouter>,
      );
      container = result.container;
    });
    const results = await axe.run(container!);
    if (results.violations.length > 0) {
      console.error(
        "Axe violations:",
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            description: v.description,
            nodes: v.nodes.map((n) => n.html),
          })),
          null,
          2,
        ),
      );
    }
    expect(results.violations).toHaveLength(0);
  });
});
