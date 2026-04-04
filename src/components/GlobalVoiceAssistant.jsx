import { Heading, Text } from "@primer/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider.jsx";
import { useCart } from "../app/providers/CartProvider.jsx";
import { getBookById, getBooks } from "../features/books/bookService.js";
import {
  buildSearchResultsPageSpeech,
  SEARCH_RESULTS_PAGE_SIZE,
} from "../features/voice/searchResultsSpeech.js";
import { handleVoiceCommand } from "../features/voice/voiceCommands.js";
import { useSpeechRecognition } from "../features/voice/useSpeechRecognition.js";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis.js";
import { VoiceButton } from "./VoiceButton.jsx";

function normalizeMatchText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeParseJson(value, fallbackValue) {
  try {
    return value ? JSON.parse(value) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function formatMoneyForSpeech(value) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildOrderDetailsSpeech(order) {
  const itemsText =
    Array.isArray(order?.items) && order.items.length > 0
      ? order.items
          .map((item) => `${item.title}, quantidade ${item.quantity}`)
          .join(". ")
      : "Sem itens registrados.";

  return `Pedido número ${order?.id}. Total ${formatMoneyForSpeech(order?.total)}. Itens: ${itemsText}.`;
}

function createEmptySearchResultsPagination() {
  return {
    query: "",
    results: [],
    pageIndex: 0,
  };
}

export function GlobalVoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { items, addToCart, decreaseFromCart, removeFromCart, clearCart } =
    useCart();
  const { speak } = useSpeechSynthesis();
  const [feedback, setFeedback] = useState("");
  const [currentDetailBook, setCurrentDetailBook] = useState(null);
  const cancelRequestedRef = useRef(false);
  const searchResultsPaginationRef = useRef(
    createEmptySearchResultsPagination(),
  );

  const resetSearchResultsPagination = useCallback(() => {
    searchResultsPaginationRef.current = createEmptySearchResultsPagination();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/books") {
      resetSearchResultsPagination();
      return;
    }

    const queryParam = new URLSearchParams(location.search).get("q") ?? "";
    if (searchResultsPaginationRef.current.query !== queryParam) {
      searchResultsPaginationRef.current = {
        query: queryParam,
        results: [],
        pageIndex: 0,
      };
    }
  }, [location.pathname, location.search, resetSearchResultsPagination]);

  useEffect(() => {
    const detailsMatch = location.pathname.match(/^\/books\/(\d+)$/);
    const detailBookId = detailsMatch?.[1];

    if (!detailBookId) {
      setCurrentDetailBook(null);
      return;
    }

    let active = true;

    async function loadCurrentDetailBook() {
      try {
        const book = await getBookById(detailBookId);
        if (active) {
          setCurrentDetailBook(book ?? null);
        }
      } catch {
        if (active) {
          setCurrentDetailBook(null);
        }
      }
    }

    loadCurrentDetailBook();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const isBookDetailsRoute = /^\/books\/\d+$/.test(location.pathname);

  const openOrderByOffset = useCallback(
    (offset) => {
      const parsedHistory = safeParseJson(
        localStorage.getItem("orderHistory"),
        [],
      );
      const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];

      if (orderHistory.length === 0) {
        const message = "Não há pedidos no histórico para navegar.";
        setFeedback(message);
        speak(message);
        navigate("/checkout");
        return;
      }

      const orderIdFromRoute = new URLSearchParams(location.search).get(
        "orderId",
      );
      const currentOrderId = Number(orderIdFromRoute);
      const currentIndex = orderHistory.findIndex(
        (order) => Number(order.id) === currentOrderId,
      );
      const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
      const targetIndex = fallbackIndex + offset;

      if (targetIndex < 0) {
        const message = "Este é o pedido mais recente do histórico.";
        setFeedback(message);
        speak(message);
        navigate(`/checkout?orderId=${orderHistory[0].id}`);
        return;
      }

      if (targetIndex >= orderHistory.length) {
        const message = "Este é o pedido mais antigo do histórico.";
        setFeedback(message);
        speak(message);
        navigate(
          `/checkout?orderId=${orderHistory[orderHistory.length - 1].id}`,
        );
        return;
      }

      const targetOrder = orderHistory[targetIndex];
      const message = `Abrindo pedido ${targetOrder.id} e lendo os dados.`;
      setFeedback(message);
      speak(buildOrderDetailsSpeech(targetOrder));
      navigate(`/checkout?orderId=${targetOrder.id}`);
    },
    [location.search, navigate, speak],
  );

  const readSearchResultsPage = useCallback(
    async (mode) => {
      if (location.pathname !== "/books") {
        const message =
          "Abra o catálogo para ouvir os livros exibidos na busca.";
        setFeedback(message);
        speak(message);
        return;
      }

      const queryParam = new URLSearchParams(location.search).get("q") ?? "";
      const cachedPagination = searchResultsPaginationRef.current;

      if (
        mode !== "start" &&
        cachedPagination.query === queryParam &&
        cachedPagination.results.length === 0
      ) {
        const message =
          'Diga "ler resultados da busca" para iniciar a leitura paginada.';
        setFeedback(message);
        speak(message);
        return;
      }

      try {
        const results =
          mode === "start" ||
          cachedPagination.query !== queryParam ||
          cachedPagination.results.length === 0
            ? await getBooks(queryParam)
            : cachedPagination.results;

        if (results.length === 0) {
          const message = queryParam
            ? `A busca por ${queryParam} não retornou livros.`
            : "Não há livros exibidos no catálogo para leitura.";
          setFeedback(message);
          speak(message);
          searchResultsPaginationRef.current = {
            query: queryParam,
            results: [],
            pageIndex: 0,
          };
          return;
        }

        const totalPages = Math.ceil(results.length / SEARCH_RESULTS_PAGE_SIZE);
        let nextPageIndex =
          cachedPagination.query === queryParam
            ? cachedPagination.pageIndex
            : 0;

        if (mode === "start") {
          nextPageIndex = 0;
        } else if (mode === "next") {
          if (nextPageIndex >= totalPages - 1) {
            const message =
              'Você já está no último bloco de resultados. Diga "ler resultados anteriores" ou "repetir resultados".';
            setFeedback(message);
            speak(message);
            return;
          }
          nextPageIndex += 1;
        } else if (mode === "previous") {
          if (nextPageIndex <= 0) {
            const message =
              'Você já está no primeiro bloco de resultados. Diga "ler próximos resultados" para avançar.';
            setFeedback(message);
            speak(message);
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

        searchResultsPaginationRef.current = {
          query: queryParam,
          results,
          pageIndex: nextPageIndex,
        };
        setFeedback(pageSpeech.feedback);
        speak(pageSpeech.spokenMessage);
      } catch {
        const message = "Não consegui ler os resultados da busca agora.";
        setFeedback(message);
        speak(message);
      }
    },
    [location.pathname, location.search, speak],
  );

  const voiceActions = useMemo(
    () => ({
      openBooks: () => navigate("/books"),
      searchBook: async (term) => {
        if (!term) {
          navigate("/books");
          return;
        }

        try {
          const results = await getBooks(term);

          if (results.length === 1) {
            const message = `A busca retornou um livro. Abrindo detalhes de ${results[0].title}.`;
            setFeedback(message);
            speak(message);
            navigate(`/books/${results[0].id}`);
            return;
          }
        } catch {
          // fall through to list with query
        }

        navigate(`/books?q=${encodeURIComponent(term)}`);
      },
      readSearchResults: async () => {
        await readSearchResultsPage("start");
      },
      readNextSearchResults: async () => {
        await readSearchResultsPage("next");
      },
      readPreviousSearchResults: async () => {
        await readSearchResultsPage("previous");
      },
      repeatSearchResults: async () => {
        await readSearchResultsPage("repeat");
      },
      openBookDetails: async (term) => {
        const normalizedTerm = String(term ?? "").trim();

        if (!normalizedTerm) {
          const message = "Informe o nome do livro para abrir os detalhes.";
          setFeedback(message);
          speak(message);
          return;
        }

        try {
          const books = await getBooks(normalizedTerm);
          const normalizedTarget = normalizeMatchText(normalizedTerm);

          const exactMatch = books.find(
            (book) => normalizeMatchText(book.title) === normalizedTarget,
          );
          const partialMatch = books.find((book) =>
            normalizeMatchText(book.title).includes(normalizedTarget),
          );
          const selectedBook = exactMatch ?? partialMatch ?? books[0];

          if (!selectedBook) {
            const message = `Não encontrei um livro chamado ${normalizedTerm}.`;
            setFeedback(message);
            speak(message);
            navigate(`/books?q=${encodeURIComponent(normalizedTerm)}`);
            return;
          }

          navigate(`/books/${selectedBook.id}`);
        } catch {
          const message = "Não consegui abrir os detalhes do livro agora.";
          setFeedback(message);
          speak(message);
        }
      },
      openVoiceHelp: () => {
        window.dispatchEvent(new CustomEvent("voice-help:open"));
        const message = "Abrindo ajuda de comandos de voz.";
        setFeedback(message);
        speak(message);
      },
      closeModal: () => {
        const hasOpenModal =
          typeof document !== "undefined" &&
          document.querySelector('[role="dialog"][aria-modal="true"]');

        if (!hasOpenModal) {
          const message = "Não há nenhuma modal aberta para fechar.";
          setFeedback(message);
          speak(message);
          return;
        }

        window.dispatchEvent(new CustomEvent("app-modal:close"));
        const message = "Fechando modal aberta.";
        setFeedback(message);
        speak(message);
      },
      logout: () => {
        logout();
        const message = "Saindo do sistema.";
        setFeedback(message);
        speak(message);
        navigate("/login");
      },
      clearCartItems: () => {
        if (items.length === 0) {
          const message = "O carrinho já está vazio.";
          setFeedback(message);
          speak(message);
          return;
        }

        clearCart();
        const message = "Carrinho limpo com sucesso.";
        setFeedback(message);
        speak(message);
      },
      readCartItems: async () => {
        if (items.length === 0) {
          const message = "Não há itens no carrinho.";
          setFeedback(message);
          speak(message);
          return;
        }

        try {
          const books = await getBooks();
          const booksById = new Map(books.map((book) => [book.id, book]));
          const spokenItems = items
            .map((item, index) => {
              const book = booksById.get(item.bookId);
              if (!book) {
                return null;
              }

              const subtotal =
                Number(item.quantity ?? 0) * Number(book.price ?? 0);
              return `Item ${index + 1}: ${book.title}, quantidade ${item.quantity}, preço ${formatMoneyForSpeech(book.price)}, subtotal ${formatMoneyForSpeech(subtotal)}`;
            })
            .filter(Boolean);

          if (spokenItems.length === 0) {
            const message =
              "Não consegui identificar os livros do carrinho agora.";
            setFeedback(message);
            speak(message);
            return;
          }

          const message =
            spokenItems.length === 1
              ? "Lendo item do carrinho."
              : `Lendo ${spokenItems.length} itens do carrinho.`;
          const spokenText = spokenItems.join(". ") + ".";
          setFeedback(message);
          speak(spokenText);
        } catch {
          const message = "Não consegui ler os itens do carrinho agora.";
          setFeedback(message);
          speak(message);
        }
      },
      readCartTotal: async () => {
        if (items.length === 0) {
          const message = `Não há itens no carrinho. O total é ${formatMoneyForSpeech(0)}.`;
          setFeedback(message);
          speak(message);
          return;
        }

        try {
          const books = await getBooks();
          const booksById = new Map(books.map((book) => [book.id, book]));

          const cartTotal = items.reduce((sum, item) => {
            const book = booksById.get(item.bookId);
            if (!book) {
              return sum;
            }

            const quantity = Number(item.quantity ?? 0);
            return sum + Number(book.price ?? 0) * quantity;
          }, 0);

          const message = `Total do carrinho: ${formatMoneyForSpeech(cartTotal)}.`;
          setFeedback(message);
          speak(message);
        } catch {
          const message = "Não consegui calcular o total do carrinho agora.";
          setFeedback(message);
          speak(message);
        }
      },
      readCartItemsCount: () => {
        const totalItems = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0),
          0,
        );

        if (totalItems <= 0) {
          const message = "Não há itens no carrinho.";
          setFeedback(message);
          speak(message);
          return;
        }

        const message =
          totalItems === 1
            ? "Há um item no carrinho."
            : `Há ${totalItems} itens no carrinho.`;
        setFeedback(message);
        speak(message);
      },
      removeLastCartItem: () => {
        if (items.length === 0) {
          const message = "O carrinho está vazio. Não há item para remover.";
          setFeedback(message);
          speak(message);
          return;
        }

        const lastItem = items[items.length - 1];
        decreaseFromCart(lastItem.bookId, 1);

        const message =
          "Removendo uma unidade do último item adicionado ao carrinho.";
        setFeedback(message);
        speak(message);
      },
      removeBookFromCart: async (bookTerm) => {
        const normalizedTerm = normalizeMatchText(bookTerm);

        if (!normalizedTerm) {
          const message = "Informe o nome do livro para remover do carrinho.";
          setFeedback(message);
          speak(message);
          return;
        }

        if (items.length === 0) {
          const message = "O carrinho está vazio. Não há livro para remover.";
          setFeedback(message);
          speak(message);
          return;
        }

        const cartBookIds = new Set(items.map((item) => item.bookId));

        try {
          const searchedBooks = await getBooks(normalizedTerm);
          const cartMatchedBooks = searchedBooks.filter((book) =>
            cartBookIds.has(book.id),
          );

          const exactMatch = cartMatchedBooks.find(
            (book) => normalizeMatchText(book.title) === normalizedTerm,
          );
          const partialMatch = cartMatchedBooks.find((book) =>
            normalizeMatchText(book.title).includes(normalizedTerm),
          );
          const selectedBook =
            exactMatch ?? partialMatch ?? cartMatchedBooks[0];

          if (!selectedBook) {
            const message = `Não encontrei o livro ${bookTerm} no carrinho.`;
            setFeedback(message);
            speak(message);
            return;
          }

          removeFromCart(selectedBook.id);
          const message = `Removendo ${selectedBook.title} do carrinho.`;
          setFeedback(message);
          speak(message);
        } catch {
          const message = "Não consegui remover o livro do carrinho agora.";
          setFeedback(message);
          speak(message);
        }
      },
      openCart: () => navigate("/cart"),
      openCheckout: () => {
        if (items.length === 0) {
          const message =
            "O carrinho está vazio. Adicione itens antes de finalizar a compra.";
          setFeedback(message);
          speak(message);
          return;
        }

        // If in cart, emit event to open dialog instead of navigating
        if (location.pathname === "/cart") {
          const message = "Abrindo diálogo de confirmação.";
          setFeedback(message);
          speak(message);
          window.dispatchEvent(new CustomEvent("cart:open-checkout-dialog"));
          return;
        }

        const message = "Abrindo checkout para finalizar a compra.";
        setFeedback(message);
        speak(message);
        navigate("/checkout");
      },
      confirmCheckout: () => {
        if (location.pathname === "/cart") {
          const message = "Confirmando pedido.";
          setFeedback(message);
          speak(message);
          window.dispatchEvent(new CustomEvent("cart:confirm-checkout"));
          return;
        }

        const message = "Este comando funciona na tela do carrinho.";
        setFeedback(message);
        speak(message);
      },
      openOrder: (orderId) => {
        const normalizedOrderId = String(orderId ?? "").trim();
        if (!normalizedOrderId) {
          const message = "Não entendi o número do pedido.";
          setFeedback(message);
          speak(message);
          return;
        }

        const parsedHistory = safeParseJson(
          localStorage.getItem("orderHistory"),
          [],
        );
        const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        const foundOrder = orderHistory.find(
          (order) => Number(order.id) === Number(normalizedOrderId),
        );

        if (foundOrder) {
          const message = `Pedido ${normalizedOrderId} encontrado. Abrindo detalhes.`;
          setFeedback(message);
          speak(message);
          navigate(
            `/checkout?orderId=${encodeURIComponent(normalizedOrderId)}`,
          );
          return;
        }

        const message = `Não encontrei o pedido ${normalizedOrderId} no histórico.`;
        setFeedback(message);
        speak(message);
        navigate(`/checkout?orderId=${encodeURIComponent(normalizedOrderId)}`);
      },
      openNextOrder: () => {
        openOrderByOffset(1);
      },
      openPreviousOrder: () => {
        openOrderByOffset(-1);
      },
      readOrderDetails: (orderIdFromCommand) => {
        if (location.pathname !== "/checkout") {
          const message =
            "Abra a tela de checkout para ouvir os dados do pedido.";
          setFeedback(message);
          speak(message);
          return;
        }

        const latestOrder = safeParseJson(
          sessionStorage.getItem("latestOrderSummary"),
          null,
        );
        const parsedHistory = safeParseJson(
          localStorage.getItem("orderHistory"),
          [],
        );
        const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        const requestedOrderFromRoute = new URLSearchParams(
          location.search,
        ).get("orderId");

        const requestedOrderId =
          String(orderIdFromCommand ?? "").trim() ||
          requestedOrderFromRoute ||
          "";

        const selectedOrder = requestedOrderId
          ? orderHistory.find(
              (order) => Number(order.id) === Number(requestedOrderId),
            )
          : latestOrder || orderHistory[0];

        if (!selectedOrder) {
          const message = "Não há dados de pedido para leitura no momento.";
          setFeedback(message);
          speak(message);
          return;
        }

        const message = `Lendo dados do pedido ${selectedOrder.id}.`;
        const spokenDetails = buildOrderDetailsSpeech(selectedOrder);

        setFeedback(message);
        speak(spokenDetails);
      },
      goBack: () => navigate(-1),
      openHome: () => navigate("/home"),
      ...(isBookDetailsRoute && currentDetailBook
        ? {
            addCurrentBookToCart: () => {
              addToCart(currentDetailBook.id);
            },
            readDescription: () => {
              if (currentDetailBook.description) {
                setFeedback("Lendo descrição do livro.");
                speak(currentDetailBook.description);
              }
            },
          }
        : {}),
      onDescriptionUnavailable: () => {
        const message = "Abra os detalhes de um livro para ouvir a descrição.";
        setFeedback(message);
        speak(message);
      },
      onUnknown: () => {
        setFeedback("Comando não reconhecido. Tente novamente.");
      },
    }),
    [
      clearCart,
      addToCart,
      currentDetailBook,
      decreaseFromCart,
      isBookDetailsRoute,
      items,
      location.pathname,
      location.search,
      logout,
      navigate,
      openOrderByOffset,
      readSearchResultsPage,
      removeFromCart,
      speak,
    ],
  );

  const speechRecognition = useSpeechRecognition({
    lang: "pt-BR",
    currentRoute: location.pathname,
    onIntent: (intentResult) => {
      cancelRequestedRef.current = false;
      const message = handleVoiceCommand(intentResult, voiceActions);
      setFeedback(message);
      if (message) {
        speak(message);
      }
    },
    onError: (recognitionError) => {
      const isCancelledByUser =
        cancelRequestedRef.current &&
        (recognitionError === "no-speech" || recognitionError === "aborted");

      if (isCancelledByUser) {
        cancelRequestedRef.current = false;
        return;
      }

      cancelRequestedRef.current = false;
      const message = `Erro no reconhecimento de voz: ${recognitionError}`;
      setFeedback(message);
      speak(message);
    },
  });

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  } = speechRecognition;

  const cancelVoiceCommand = useCallback(() => {
    cancelRequestedRef.current = true;
    stopListening();

    const message =
      "Comando de voz cancelado. Pressione espaço para tentar novamente.";
    setFeedback(message);
    speak(message);
  }, [stopListening, speak]);

  useEffect(() => {
    function handleSpaceToggle(event) {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      const activeElement = event.target;
      const tagName = activeElement?.tagName?.toLowerCase();
      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        activeElement?.isContentEditable;

      if (isTypingField) {
        return;
      }

      event.preventDefault();

      if (isListening) {
        cancelVoiceCommand();
        return;
      }

      startListening();
    }

    window.addEventListener("keydown", handleSpaceToggle);

    return () => {
      window.removeEventListener("keydown", handleSpaceToggle);
    };
  }, [cancelVoiceCommand, isListening, startListening]);

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 200,
        border: "1px solid #d0d7de",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        padding: 12,
        width: 320,
        boxShadow: "0 8px 20px rgba(31, 35, 40, 0.12)",
      }}
      aria-label="Assistente de voz global"
    >
      <Heading as="h3" sx={{ fontSize: 1 }}>
        Assistente de voz
      </Heading>

      <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
        Rota atual: {location.pathname}
      </Text>

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <VoiceButton
          isListening={isListening}
          isSupported={isSupported}
          onStart={startListening}
          onStop={cancelVoiceCommand}
        />
      </div>

      <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
        Último comando: {transcript || "nenhum"}
      </Text>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {feedback}
      </div>
    </div>
  );
}
