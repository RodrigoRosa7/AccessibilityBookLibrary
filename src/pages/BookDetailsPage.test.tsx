import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axe from "axe-core";
import { BookDetailsPage } from "./BookDetailsPage";
import { CartProvider } from "../app/providers/CartProvider";
vi.mock("../features/books/bookService", () => ({
  getBookById: vi.fn().mockResolvedValue({
    id: 1,
    title: "Dom Casmurro",
    author: "Machado de Assis",
    description: "Romance sobre memória, ciúme e dúvida na elite carioca do século dezenove.",
    price: 96,
  }),
}));

vi.mock("../features/voice/useSpeechSynthesis", () => ({
  useSpeechSynthesis: vi.fn().mockReturnValue({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

describe("BookDetailsPage accessibility", () => {
  it("has no axe violations after book loads", async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MemoryRouter initialEntries={["/books/1"]}>
          <CartProvider>
            <Routes>
              <Route path="/books/:id" element={<BookDetailsPage />} />
            </Routes>
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
