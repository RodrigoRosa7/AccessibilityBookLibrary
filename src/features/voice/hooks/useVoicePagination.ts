import { useCallback, useEffect, useRef } from "react";
import type { NavigateFunction } from "react-router-dom";
import { getBooks } from "../../books/bookService";
import {
  buildSearchResultsPageSpeech,
  SEARCH_RESULTS_PAGE_SIZE,
  type SearchResultsSpeechMode,
} from "../searchResultsSpeech";
import type { Book, Order } from "../../../types";
import type { SpeechSeverity } from "../useSpeechSynthesis";

interface SearchResultsPagination {
  query: string;
  results: Book[];
  pageIndex: number;
}

interface UseVoicePaginationOptions {
  pathname: string;
  search: string;
  navigate: NavigateFunction;
  setFeedback: (message: string, severity?: SpeechSeverity) => void;
  speak: (text: string) => void;
  speakMessage: (message: string, severity?: SpeechSeverity) => void;
}

export interface UseVoicePaginationReturn {
  readSearchResultsPage: (mode: SearchResultsSpeechMode) => Promise<void>;
  openOrderByOffset: (offset: number) => void;
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatMoneyForSpeech(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildOrderDetailsSpeech(order: Order): string {
  const itemsText =
    Array.isArray(order?.items) && order.items.length > 0
      ? order.items
          .map((item) => `${item.title}, quantidade ${item.quantity}`)
          .join(". ")
      : "Sem itens registrados.";
  return `Pedido número ${order?.id}. Total ${formatMoneyForSpeech(order?.total)}. Itens: ${itemsText}.`;
}

export function useVoicePagination({
  pathname,
  search,
  navigate,
  setFeedback,
  speak,
  speakMessage,
}: UseVoicePaginationOptions): UseVoicePaginationReturn {
  const paginationRef = useRef<SearchResultsPagination>({
    query: "",
    results: [],
    pageIndex: 0,
  });

  useEffect(() => {
    if (pathname !== "/books") {
      paginationRef.current = { query: "", results: [], pageIndex: 0 };
      return;
    }
    const queryParam = new URLSearchParams(search).get("q") ?? "";
    if (paginationRef.current.query !== queryParam) {
      paginationRef.current = { query: queryParam, results: [], pageIndex: 0 };
    }
  }, [pathname, search]);

  const readSearchResultsPage = useCallback(
    async (mode: SearchResultsSpeechMode) => {
      if (pathname !== "/books") {
        speakMessage("Abra o catálogo para ouvir os livros exibidos na busca.");
        return;
      }

      const queryParam = new URLSearchParams(search).get("q") ?? "";
      const cached = paginationRef.current;

      if (
        mode !== "start" &&
        cached.query === queryParam &&
        cached.results.length === 0
      ) {
        speakMessage('Diga "ler resultados da busca" para iniciar a leitura paginada.');
        return;
      }

      try {
        const results =
          mode === "start" ||
          cached.query !== queryParam ||
          cached.results.length === 0
            ? await getBooks(queryParam)
            : cached.results;

        if (results.length === 0) {
          const message = queryParam
            ? `A busca por ${queryParam} não retornou livros.`
            : "Não há livros exibidos no catálogo para leitura.";
          speakMessage(message);
          paginationRef.current = { query: queryParam, results: [], pageIndex: 0 };
          return;
        }

        const totalPages = Math.ceil(results.length / SEARCH_RESULTS_PAGE_SIZE);
        let nextPageIndex = cached.query === queryParam ? cached.pageIndex : 0;

        if (mode === "start") {
          nextPageIndex = 0;
        } else if (mode === "next") {
          if (nextPageIndex >= totalPages - 1) {
            speakMessage(
              'Você já está no último bloco de resultados. Diga "ler resultados anteriores" ou "repetir resultados".',
            );
            return;
          }
          nextPageIndex += 1;
        } else if (mode === "previous") {
          if (nextPageIndex <= 0) {
            speakMessage(
              'Você já está no primeiro bloco de resultados. Diga "ler próximos resultados" para avançar.',
            );
            return;
          }
          nextPageIndex -= 1;
        }

        const pageSpeech = buildSearchResultsPageSpeech({
          results,
          query: queryParam,
          pageIndex: nextPageIndex,
          mode,
        });

        paginationRef.current = { query: queryParam, results, pageIndex: nextPageIndex };
        setFeedback(pageSpeech.feedback);
        speak(pageSpeech.spokenMessage);
      } catch {
        speakMessage("Não consegui ler os resultados da busca agora.");
      }
    },
    [pathname, search, setFeedback, speak, speakMessage],
  );

  const openOrderByOffset = useCallback(
    (offset: number) => {
      const parsedHistory = safeParseJson<Order[]>(localStorage.getItem("orderHistory"), []);
      const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];

      if (orderHistory.length === 0) {
        speakMessage("Não há pedidos no histórico para navegar.");
        navigate("/checkout");
        return;
      }

      const orderIdFromRoute = new URLSearchParams(search).get("orderId");
      const currentOrderId = Number(orderIdFromRoute);
      const currentIndex = orderHistory.findIndex(
        (order) => Number(order.id) === currentOrderId,
      );
      const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
      const targetIndex = fallbackIndex + offset;

      if (targetIndex < 0) {
        speakMessage("Este é o pedido mais recente do histórico.");
        navigate(`/checkout?orderId=${orderHistory[0].id}`);
        return;
      }

      if (targetIndex >= orderHistory.length) {
        speakMessage("Este é o pedido mais antigo do histórico.");
        navigate(`/checkout?orderId=${orderHistory[orderHistory.length - 1].id}`);
        return;
      }

      const targetOrder = orderHistory[targetIndex];
      setFeedback(`Abrindo pedido ${targetOrder.id} e lendo os dados.`);
      speak(buildOrderDetailsSpeech(targetOrder));
      navigate(`/checkout?orderId=${targetOrder.id}`);
    },
    [search, navigate, setFeedback, speak, speakMessage],
  );

  return { readSearchResultsPage, openOrderByOffset };
}
