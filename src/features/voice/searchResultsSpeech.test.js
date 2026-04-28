import { describe, expect, it } from "vitest";
import {
  buildSearchResultsPageSpeech,
  getSearchResultsSummaryMessage,
} from "./searchResultsSpeech";

const sampleBooks = [
  { title: "Livro A", author: "Autor A", price: 10 },
  { title: "Livro B", author: "Autor B", price: 20 },
  { title: "Livro C", author: "Autor C", price: 30 },
  { title: "Livro D", author: "Autor D", price: 40 },
];

describe("searchResultsSpeech", () => {
  it("adds pagination guidance when summary has more than one page", () => {
    const message = getSearchResultsSummaryMessage({
      total: 4,
      query: "react",
    });

    expect(message).toContain("A busca retornou 4 livros.");
    expect(message).toContain("ler resultados da busca");
  });

  it("builds first page speech with next guidance", () => {
    const result = buildSearchResultsPageSpeech({
      results: sampleBooks,
      query: "react",
      pageIndex: 0,
      mode: "start",
    });

    expect(result.feedback).toContain("Lendo resultados 1 a 3 de 4.");
    expect(result.spokenMessage).toContain("Livro 1. Livro A.");
    expect(result.spokenMessage).toContain("Autor Autor A.");
    expect(result.spokenMessage).toContain("ler próximos resultados");
  });

  it("builds last page speech with previous guidance", () => {
    const result = buildSearchResultsPageSpeech({
      results: sampleBooks,
      query: "react",
      pageIndex: 1,
      mode: "next",
    });

    expect(result.feedback).toBe("Lendo resultados 4 a 4 de 4.");
    expect(result.spokenMessage).toContain("Livro 4. Livro D.");
    expect(result.spokenMessage).toContain("último bloco");
    expect(result.spokenMessage).toContain("ler resultados anteriores");
  });
});
