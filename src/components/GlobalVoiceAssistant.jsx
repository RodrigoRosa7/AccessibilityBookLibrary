import { Heading, Text } from "@primer/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../app/providers/CartProvider.jsx";
import { getBookById, getBooks } from "../features/books/bookService.js";
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

export function GlobalVoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { speak } = useSpeechSynthesis();
  const [feedback, setFeedback] = useState("");
  const [currentDetailBook, setCurrentDetailBook] = useState(null);
  const cancelRequestedRef = useRef(false);

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
      const message = `Abrindo pedido ${targetOrder.id}.`;
      setFeedback(message);
      speak(message);
      navigate(`/checkout?orderId=${targetOrder.id}`);
    },
    [location.search, navigate, speak],
  );

  const voiceActions = useMemo(
    () => ({
      openBooks: () => navigate("/books"),
      searchBook: (term) => {
        const search = term ? `?q=${encodeURIComponent(term)}` : "";
        navigate(`/books${search}`);
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
      openCart: () => navigate("/cart"),
      openCheckout: () => navigate("/checkout"),
      openOrder: (orderId) => {
        const normalizedOrderId = String(orderId ?? "").trim();
        if (!normalizedOrderId) {
          const message = "Não entendi o numero do pedido.";
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

        const itemsText = Array.isArray(selectedOrder.items)
          ? selectedOrder.items
              .map((item) => `${item.title}, quantidade ${item.quantity}`)
              .join(". ")
          : "Sem itens registrados.";

        const message = `Lendo dados do pedido ${selectedOrder.id}.`;
        const spokenDetails = `Pedido número ${selectedOrder.id}. Total ${formatMoneyForSpeech(selectedOrder.total)}. Itens: ${itemsText}.`;

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
                speak(currentDetailBook.description);
              }
            },
          }
        : {}),
      onUnknown: () => {
        setFeedback("Comando não reconhecido. Tente novamente.");
      },
    }),
    [
      addToCart,
      currentDetailBook,
      isBookDetailsRoute,
      location.pathname,
      location.search,
      navigate,
      openOrderByOffset,
      speak,
    ],
  );

  const speechRecognition = useSpeechRecognition({
    lang: "pt-BR",
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
        Ultimo comando: {transcript || "nenhum"}
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
