import type { Book } from "../../types";

export const SEARCH_RESULTS_PAGE_SIZE = 3;

export type SearchResultsSpeechMode = "start" | "next" | "previous" | "repeat";

export interface SearchResultsSummaryArgs {
  total: number;
  query?: string;
  pageSize?: number;
}

export interface SearchResultsPageSpeechArgs {
  results: Book[];
  query?: string;
  pageIndex: number;
  pageSize?: number;
  mode?: SearchResultsSpeechMode;
}

export interface SearchResultsPageSpeech {
  feedback: string;
  spokenMessage: string;
}

function formatMoneyForSpeech(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getResultsPrefix(total: number, query?: string): string {
  if (query) {
    if (total === 0) {
      return `A busca por ${query} não retornou livros.`;
    }

    if (total === 1) {
      return "A busca retornou um livro.";
    }

    return `A busca retornou ${total} livros.`;
  }

  if (total === 0) {
    return "Não há livros exibidos no catálogo para leitura.";
  }

  if (total === 1) {
    return "Há um livro exibido no catálogo.";
  }

  return `Há ${total} livros exibidos no catálogo.`;
}

export function getSearchResultsSummaryMessage({
  total,
  query,
  pageSize = SEARCH_RESULTS_PAGE_SIZE,
}: SearchResultsSummaryArgs): string {
  const prefix = getResultsPrefix(total, query);

  if (!query || total <= 1 || total <= pageSize) {
    return prefix;
  }

  return `${prefix} Diga ler resultados da busca para ouvir os ${pageSize} primeiros.`;
}

export function buildSearchResultsPageSpeech({
  results,
  query,
  pageIndex,
  pageSize = SEARCH_RESULTS_PAGE_SIZE,
  mode = "start",
}: SearchResultsPageSpeechArgs): SearchResultsPageSpeech {
  const total = Array.isArray(results) ? results.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
  const start = safePageIndex * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageResults = results.slice(start, end);
  const prefix = getResultsPrefix(total, query);

  if (pageResults.length === 0) {
    return {
      feedback: prefix,
      spokenMessage: prefix,
    };
  }

  const itemsText = pageResults
    .map(
      (book, index) =>
        `Livro ${start + index + 1}. ${book.title}. Autor ${book.author}. Preço ${formatMoneyForSpeech(book.price)}.`,
    )
    .join(" ");

  const rangeText = `resultados ${start + 1} a ${end} de ${total}`;
  let feedback = prefix;
  let guidance = "";

  if (total > pageSize) {
    if (mode === "repeat") {
      feedback = `Repetindo ${rangeText}.`;
    } else if (mode === "start") {
      feedback = `${prefix} Lendo ${rangeText}.`;
    } else {
      feedback = `Lendo ${rangeText}.`;
    }

    if (safePageIndex === 0) {
      guidance =
        ' Diga "ler próximos resultados" para continuar ou "repetir resultados" para ouvir novamente este bloco.';
    } else if (safePageIndex === totalPages - 1) {
      guidance =
        ' Este é o último bloco. Diga "ler resultados anteriores" para voltar ou "repetir resultados" para ouvir novamente este bloco.';
    } else {
      guidance =
        ' Diga "ler próximos resultados" para continuar, "ler resultados anteriores" para voltar ou "repetir resultados" para ouvir novamente este bloco.';
    }
  }

  return {
    feedback,
    spokenMessage: `${feedback} ${itemsText}${guidance}`,
  };
}
