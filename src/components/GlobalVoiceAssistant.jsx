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
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();
  const [feedback, setFeedback] = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState("info");
  const [voiceError, setVoiceError] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [currentDetailBook, setCurrentDetailBook] = useState(null);
  const cancelRequestedRef = useRef(false);
  const searchResultsPaginationRef = useRef(
    createEmptySearchResultsPagination(),
  );

  const setAssistantFeedback = useCallback((message, severity = "info") => {
    setFeedback(String(message ?? ""));
    setFeedbackSeverity(severity);
  }, []);

  const speakAssistantMessage = useCallback(
    (message, severity = "info") => {
      const normalizedMessage = String(message ?? "").trim();
      if (!normalizedMessage) {
        return;
      }

      setAssistantFeedback(normalizedMessage, severity);
      setVoiceError(severity === "critical" ? normalizedMessage : "");
      speak(normalizedMessage, { severity });
    },
    [setAssistantFeedback, speak],
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
        speakAssistantMessage(message);
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
        speakAssistantMessage(message);
        navigate(`/checkout?orderId=${orderHistory[0].id}`);
        return;
      }

      if (targetIndex >= orderHistory.length) {
        const message = "Este é o pedido mais antigo do histórico.";
        speakAssistantMessage(message);
        navigate(
          `/checkout?orderId=${orderHistory[orderHistory.length - 1].id}`,
        );
        return;
      }

      const targetOrder = orderHistory[targetIndex];
      const message = `Abrindo pedido ${targetOrder.id} e lendo os dados.`;
      setAssistantFeedback(message);
      speak(buildOrderDetailsSpeech(targetOrder));
      navigate(`/checkout?orderId=${targetOrder.id}`);
    },
    [
      location.search,
      navigate,
      setAssistantFeedback,
      speak,
      speakAssistantMessage,
    ],
  );

  const readSearchResultsPage = useCallback(
    async (mode) => {
      if (location.pathname !== "/books") {
        const message =
          "Abra o catálogo para ouvir os livros exibidos na busca.";
        speakAssistantMessage(message);
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
        speakAssistantMessage(message);
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
          speakAssistantMessage(message);
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
            speakAssistantMessage(message);
            return;
          }
          nextPageIndex += 1;
        } else if (mode === "previous") {
          if (nextPageIndex <= 0) {
            const message =
              'Você já está no primeiro bloco de resultados. Diga "ler próximos resultados" para avançar.';
            speakAssistantMessage(message);
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
        setAssistantFeedback(pageSpeech.feedback);
        speak(pageSpeech.spokenMessage);
      } catch {
        const message = "Não consegui ler os resultados da busca agora.";
        speakAssistantMessage(message);
      }
    },
    [
      location.pathname,
      location.search,
      setAssistantFeedback,
      speak,
      speakAssistantMessage,
    ],
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
            speakAssistantMessage(message);
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
          speakAssistantMessage(message);
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
            speakAssistantMessage(message);
            navigate(`/books?q=${encodeURIComponent(normalizedTerm)}`);
            return;
          }

          navigate(`/books/${selectedBook.id}`);
        } catch {
          const message = "Não consegui abrir os detalhes do livro agora.";
          speakAssistantMessage(message);
        }
      },
      openVoiceHelp: () => {
        window.dispatchEvent(new CustomEvent("voice-help:open"));
        setAssistantFeedback("Abrindo ajuda de comandos de voz.");
      },
      repeatPageGuidance: () => {
        window.dispatchEvent(new CustomEvent("voice-guidance:repeat"));
        setAssistantFeedback("Repetindo instruções da página.");
      },
      closeModal: () => {
        const hasOpenModal =
          typeof document !== "undefined" &&
          document.querySelector('[role="dialog"][aria-modal="true"]');

        if (!hasOpenModal) {
          const message = "Não há nenhuma modal aberta para fechar.";
          speakAssistantMessage(message);
          return;
        }

        window.dispatchEvent(new CustomEvent("app-modal:close"));
        const message = "Fechando modal aberta.";
        speakAssistantMessage(message);
      },
      logout: () => {
        logout();
        const message = "Saindo do sistema.";
        speakAssistantMessage(message);
        navigate("/login");
      },
      clearCartItems: () => {
        if (items.length === 0) {
          const message = "O carrinho já está vazio.";
          speakAssistantMessage(message);
          return;
        }

        clearCart();
        const message = "Carrinho limpo com sucesso.";
        speakAssistantMessage(message);
      },
      readCartItems: async () => {
        if (items.length === 0) {
          const message = "Não há itens no carrinho.";
          speakAssistantMessage(message);
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
            speakAssistantMessage(message);
            return;
          }

          const message =
            spokenItems.length === 1
              ? "Lendo item do carrinho."
              : `Lendo ${spokenItems.length} itens do carrinho.`;
          const spokenText = spokenItems.join(". ") + ".";
          setAssistantFeedback(message);
          speak(spokenText);
        } catch {
          const message = "Não consegui ler os itens do carrinho agora.";
          speakAssistantMessage(message);
        }
      },
      readCartTotal: async () => {
        if (items.length === 0) {
          const message = `Não há itens no carrinho. O total é ${formatMoneyForSpeech(0)}.`;
          speakAssistantMessage(message);
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
          speakAssistantMessage(message);
        } catch {
          const message = "Não consegui calcular o total do carrinho agora.";
          speakAssistantMessage(message);
        }
      },
      readCartItemsCount: () => {
        const totalItems = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0),
          0,
        );

        if (totalItems <= 0) {
          const message = "Não há itens no carrinho.";
          speakAssistantMessage(message);
          return;
        }

        const message =
          totalItems === 1
            ? "Há um item no carrinho."
            : `Há ${totalItems} itens no carrinho.`;
        speakAssistantMessage(message);
      },
      removeLastCartItem: () => {
        if (items.length === 0) {
          const message = "O carrinho está vazio. Não há item para remover.";
          speakAssistantMessage(message);
          return;
        }

        const lastItem = items[items.length - 1];
        decreaseFromCart(lastItem.bookId, 1);

        const message =
          "Removendo uma unidade do último item adicionado ao carrinho.";
        speakAssistantMessage(message);
      },
      removeBookFromCart: async (bookTerm) => {
        const normalizedTerm = normalizeMatchText(bookTerm);

        if (!normalizedTerm) {
          const message = "Informe o nome do livro para remover do carrinho.";
          speakAssistantMessage(message);
          return;
        }

        if (items.length === 0) {
          const message = "O carrinho está vazio. Não há livro para remover.";
          speakAssistantMessage(message);
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
            speakAssistantMessage(message);
            return;
          }

          removeFromCart(selectedBook.id);
          const message = `Removendo ${selectedBook.title} do carrinho.`;
          speakAssistantMessage(message);
        } catch {
          const message = "Não consegui remover o livro do carrinho agora.";
          speakAssistantMessage(message);
        }
      },
      openCart: () => navigate("/cart"),
      openCheckout: () => {
        // If in cart, open the purchase confirmation dialog (requires items)
        if (location.pathname === "/cart") {
          if (items.length === 0) {
            const message =
              "O carrinho está vazio. Adicione itens antes de finalizar a compra.";
            speakAssistantMessage(message);
            return;
          }

          const message = "Abrindo diálogo de confirmação.";
          speakAssistantMessage(message);
          window.dispatchEvent(new CustomEvent("cart:open-checkout-dialog"));
          return;
        }

        // Otherwise navigate to order history (no cart check needed)
        const message = "Abrindo pedidos.";
        speakAssistantMessage(message);
        navigate("/checkout");
      },
      confirmCheckout: () => {
        if (location.pathname === "/cart") {
          const message = "Confirmando pedido.";
          speakAssistantMessage(message);
          window.dispatchEvent(new CustomEvent("cart:confirm-checkout"));
          return;
        }

        const message = "Este comando funciona na tela do carrinho.";
        speakAssistantMessage(message);
      },
      openOrder: (orderId) => {
        const normalizedOrderId = String(orderId ?? "").trim();
        if (!normalizedOrderId) {
          const message = "Não entendi o número do pedido.";
          speakAssistantMessage(message);
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
          speakAssistantMessage(message);
          navigate(
            `/checkout?orderId=${encodeURIComponent(normalizedOrderId)}`,
          );
          return;
        }

        const message = `Não encontrei o pedido ${normalizedOrderId} no histórico.`;
        speakAssistantMessage(message);
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
            "Abra a tela de pedidos para ouvir os dados do pedido.";
          speakAssistantMessage(message);
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
          speakAssistantMessage(message);
          return;
        }

        const message = `Lendo dados do pedido ${selectedOrder.id}.`;
        const spokenDetails = buildOrderDetailsSpeech(selectedOrder);

        setAssistantFeedback(message);
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
                setAssistantFeedback("Lendo descrição do livro.");
                speak(currentDetailBook.description);
              }
            },
          }
        : {}),
      onDescriptionUnavailable: () => {
        const message = "Abra os detalhes de um livro para ouvir a descrição.";
        speakAssistantMessage(message);
      },
      onUnknown: () => {
        setAssistantFeedback("Comando não reconhecido. Tente novamente.");
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
      setAssistantFeedback,
      speak,
      speakAssistantMessage,
    ],
  );

  const speechRecognition = useSpeechRecognition({
    lang: "pt-BR",
    currentRoute: location.pathname,
    onTranscript: (nextTranscript) => {
      setLastCommand(nextTranscript);
    },
    onIntent: (intentResult) => {
      cancelRequestedRef.current = false;
      setVoiceError("");
      const message = handleVoiceCommand(intentResult, voiceActions);
      setAssistantFeedback(message);
      if (message) {
        cancel();
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
      setVoiceError(message);
      speakAssistantMessage(message, "critical");
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
    cancel();

    const message =
      "Comando de voz cancelado. Pressione espaço para tentar novamente.";
    speakAssistantMessage(message);
  }, [cancel, speakAssistantMessage, stopListening]);

  const startVoiceCommand = useCallback(() => {
    cancel();
    setVoiceError("");
    startListening();
  }, [cancel, startListening]);

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

      startVoiceCommand();
    }

    window.addEventListener("keydown", handleSpaceToggle);

    return () => {
      window.removeEventListener("keydown", handleSpaceToggle);
    };
  }, [cancelVoiceCommand, isListening, startVoiceCommand]);

  const voiceState = useMemo(
    () => ({
      isListening,
      isSpeaking,
      voiceError,
      lastCommand,
      lastAssistantMessage: feedback,
    }),
    [feedback, isListening, isSpeaking, lastCommand, voiceError],
  );

  return (
    <div
      className="voice-assistant-panel"
      aria-label="Assistente de voz global"
    >
      <Heading as="h3" sx={{ fontSize: 1 }}>
        Assistente de voz
      </Heading>

      <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
        Rota atual: {location.pathname}
      </Text>

      <div className="voice-assistant-status">
        <VoiceButton
          isListening={voiceState.isListening}
          isSpeaking={voiceState.isSpeaking}
          isSupported={isSupported}
          onStart={startVoiceCommand}
          onStop={cancelVoiceCommand}
        />
      </div>

      <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
        Último comando: {voiceState.lastCommand || transcript || "nenhum"}
      </Text>

      <Text as="p" sx={{ color: "fg.muted", fontSize: 1 }}>
        Estado: {voiceState.isListening ? "escutando" : "em espera"}
        {voiceState.isSpeaking ? " e falando" : ""}
      </Text>

      {voiceState.voiceError ? (
        <Text as="p" sx={{ color: "danger.fg", fontSize: 1 }}>
          {voiceState.voiceError}
        </Text>
      ) : null}

      <div
        role={feedbackSeverity === "critical" ? "alert" : "status"}
        aria-live={feedbackSeverity === "critical" ? "assertive" : "polite"}
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
        {voiceState.lastAssistantMessage}
      </div>
    </div>
  );
}
