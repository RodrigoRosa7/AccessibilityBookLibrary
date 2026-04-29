import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useCart } from "../../../app/providers/CartProvider";
import { getBooks, getBookById } from "../../books/bookService";
import {
  getGlobalVoiceCommands,
  getPageVoiceGuidance,
  getSessionModalCommands,
} from "../../contextual/pageVoiceGuidance";
import type { Book, Order, VoiceActions } from "../../../types";
import { formatMoneyForSpeech, buildOrderDetailsSpeech } from "../domain/speechUtils";
import { useVoiceFeedback } from "./useVoiceFeedback";
import type { SpeechSeverity } from "./useVoiceFeedback";
import { useVoicePagination } from "./useVoicePagination";
import { useVoiceCommands } from "./useVoiceCommands";

export interface UseVoiceAssistantReturn {
  feedback: string;
  feedbackSeverity: SpeechSeverity;
  voiceError: string;
  isSpeaking: boolean;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  lastCommand: string;
  typedCommand: string;
  setTypedCommand: (value: string) => void;
  startVoiceCommand: () => void;
  cancelVoiceCommand: () => void;
  runTypedCommand: (event: React.FormEvent) => void;
  pathname: string;
}

function normalizeMatchText(text: string | null | undefined): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}


export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { items, addToCart, decreaseFromCart, removeFromCart, clearCart } = useCart();
  const [currentDetailBook, setCurrentDetailBook] = useState<Book | null>(null);

  const {
    feedback,
    feedbackSeverity,
    voiceError,
    isSpeaking,
    setFeedback,
    setVoiceError,
    speakMessage,
    speak,
    cancel,
  } = useVoiceFeedback();

  useEffect(() => {
    const match = location.pathname.match(/^\/books\/(\d+)$/);
    const bookId = match?.[1];

    if (!bookId) {
      setCurrentDetailBook(null);
      return;
    }

    let active = true;
    getBookById(bookId)
      .then((book) => {
        if (active) setCurrentDetailBook(book ?? null);
      })
      .catch(() => {
        if (active) setCurrentDetailBook(null);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const isBookDetailsRoute = /^\/books\/\d+$/.test(location.pathname);

  const { readSearchResultsPage, openOrderByOffset } = useVoicePagination({
    pathname: location.pathname,
    search: location.search,
    navigate,
    setFeedback,
    speak,
    speakMessage,
  });

  const voiceActions = useMemo<VoiceActions>(
    () => ({
      replayVoiceOnboarding: () => {
        const hasModal =
          typeof document !== "undefined" &&
          document.querySelector('[data-modal-id="voice-onboarding"]');
        if (!hasModal) {
          speakMessage("A apresentação inicial não está aberta.");
          return;
        }
        window.dispatchEvent(new CustomEvent("voice-onboarding:replay"));
        setFeedback("Repetindo a apresentação inicial.");
      },
      completeVoiceOnboarding: () => {
        const hasModal =
          typeof document !== "undefined" &&
          document.querySelector('[data-modal-id="voice-onboarding"]');
        if (!hasModal) {
          speakMessage("A apresentação inicial não está aberta.");
          return;
        }
        window.dispatchEvent(new CustomEvent("voice-onboarding:complete"));
        speakMessage("Concluindo apresentação inicial.");
      },
      skipVoiceOnboarding: () => {
        const hasModal =
          typeof document !== "undefined" &&
          document.querySelector('[data-modal-id="voice-onboarding"]');
        if (!hasModal) {
          speakMessage("A apresentação inicial não está aberta.");
          return;
        }
        window.dispatchEvent(new CustomEvent("voice-onboarding:skip"));
        speakMessage("Pulando apresentação por agora.");
      },
      openBooks: () => navigate("/books"),
      searchBook: async (term: string) => {
        if (!term) {
          navigate("/books");
          return;
        }
        try {
          const results = await getBooks(term);
          if (results.length === 1) {
            speakMessage(`A busca retornou um livro. Abrindo detalhes de ${results[0].title}.`);
            navigate(`/books/${results[0].id}`);
            return;
          }
        } catch {
          // fall through to search results list
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
      openBookDetails: async (term: string) => {
        const normalizedTerm = String(term ?? "").trim();
        if (!normalizedTerm) {
          speakMessage("Informe o nome do livro para abrir os detalhes.");
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
            speakMessage(`Não encontrei um livro chamado ${normalizedTerm}.`);
            navigate(`/books?q=${encodeURIComponent(normalizedTerm)}`);
            return;
          }
          navigate(`/books/${selectedBook.id}`);
        } catch {
          speakMessage("Não consegui abrir os detalhes do livro agora.");
        }
      },
      selectBook: async (term: string) => {
        const normalizedTerm = String(term ?? "").trim();
        if (!normalizedTerm) {
          speakMessage("Informe o nome do livro para selecionar.");
          return;
        }
        if (location.pathname !== "/books") {
          speakMessage("Abra o catálogo de livros para selecionar um livro por voz.");
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
            speakMessage(`Não encontrei um livro chamado ${normalizedTerm} no catálogo.`);
            return;
          }
          speakMessage(`Selecionando ${selectedBook.title}. Abrindo detalhes.`);
          navigate(`/books/${selectedBook.id}`);
        } catch {
          speakMessage("Não consegui selecionar o livro agora.");
        }
      },
      openVoiceHelp: () => {
        const routeGuidance = getPageVoiceGuidance(location.pathname);
        const essentialCommands = getGlobalVoiceCommands();
        const sessionCommands = getSessionModalCommands();
        const speechText = [
          "Abrindo ajuda de comandos de voz.",
          routeGuidance.speechText,
          `Comandos essenciais: ${essentialCommands.join(", ")}.`,
          `Comandos de sessão e modais: ${sessionCommands.join(", ")}.`,
        ].join(" ");
        window.dispatchEvent(new CustomEvent("voice-help:open"));
        setFeedback("Abrindo ajuda de comandos de voz.");
        speak(speechText);
      },
      repeatPageGuidance: () => {
        window.dispatchEvent(new CustomEvent("voice-guidance:repeat"));
        setFeedback("Repetindo instruções da página.");
      },
      closeModal: () => {
        const hasOpenModal =
          typeof document !== "undefined" &&
          document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!hasOpenModal) {
          speakMessage("Não há nenhuma modal aberta para fechar.");
          return;
        }
        window.dispatchEvent(new CustomEvent("app-modal:close"));
        speakMessage("Fechando modal aberta.");
      },
      logout: () => {
        logout();
        speakMessage("Saindo do sistema.");
        navigate("/login");
      },
      clearCartItems: () => {
        if (items.length === 0) {
          speakMessage("O carrinho já está vazio.");
          return;
        }
        clearCart();
        speakMessage("Carrinho limpo com sucesso.");
      },
      readCartItems: async () => {
        if (items.length === 0) {
          speakMessage("Não há itens no carrinho.");
          return;
        }
        try {
          const books = await getBooks();
          const booksById = new Map(books.map((book) => [book.id, book]));
          const spokenItems = items
            .map((item, index) => {
              const book = booksById.get(item.bookId);
              if (!book) return null;
              const subtotal =
                Number(item.quantity ?? 0) * Number(book.price ?? 0);
              return `Item ${index + 1}: ${book.title}, quantidade ${item.quantity}, preço ${formatMoneyForSpeech(book.price)}, subtotal ${formatMoneyForSpeech(subtotal)}`;
            })
            .filter(Boolean) as string[];
          if (spokenItems.length === 0) {
            speakMessage("Não consegui identificar os livros do carrinho agora.");
            return;
          }
          const message =
            spokenItems.length === 1
              ? "Lendo item do carrinho."
              : `Lendo ${spokenItems.length} itens do carrinho.`;
          setFeedback(message);
          speak(spokenItems.join(". ") + ".");
        } catch {
          speakMessage("Não consegui ler os itens do carrinho agora.");
        }
      },
      readCartTotal: async () => {
        if (items.length === 0) {
          speakMessage(`Não há itens no carrinho. O total é ${formatMoneyForSpeech(0)}.`);
          return;
        }
        try {
          const books = await getBooks();
          const booksById = new Map(books.map((book) => [book.id, book]));
          const cartTotal = items.reduce((sum, item) => {
            const book = booksById.get(item.bookId);
            if (!book) return sum;
            return sum + Number(book.price ?? 0) * Number(item.quantity ?? 0);
          }, 0);
          speakMessage(`Total do carrinho: ${formatMoneyForSpeech(cartTotal)}.`);
        } catch {
          speakMessage("Não consegui calcular o total do carrinho agora.");
        }
      },
      readCartItemsCount: () => {
        const totalItems = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0),
          0,
        );
        if (totalItems <= 0) {
          speakMessage("Não há itens no carrinho.");
          return;
        }
        speakMessage(
          totalItems === 1
            ? "Há um item no carrinho."
            : `Há ${totalItems} itens no carrinho.`,
        );
      },
      removeLastCartItem: () => {
        if (items.length === 0) {
          speakMessage("O carrinho está vazio. Não há item para remover.");
          return;
        }
        const lastItem = items[items.length - 1];
        decreaseFromCart(lastItem.bookId, 1);
        speakMessage("Removendo uma unidade do último item adicionado ao carrinho.");
      },
      removeBookFromCart: async (bookTerm: string) => {
        const normalizedTerm = normalizeMatchText(bookTerm);
        if (!normalizedTerm) {
          speakMessage("Informe o nome do livro para remover do carrinho.");
          return;
        }
        if (items.length === 0) {
          speakMessage("O carrinho está vazio. Não há livro para remover.");
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
          const selectedBook = exactMatch ?? partialMatch ?? cartMatchedBooks[0];
          if (!selectedBook) {
            speakMessage(`Não encontrei o livro ${bookTerm} no carrinho.`);
            return;
          }
          removeFromCart(selectedBook.id);
          speakMessage(`Removendo ${selectedBook.title} do carrinho.`);
        } catch {
          speakMessage("Não consegui remover o livro do carrinho agora.");
        }
      },
      openCart: () => navigate("/cart"),
      openCheckout: () => {
        if (location.pathname === "/cart") {
          if (items.length === 0) {
            speakMessage(
              "O carrinho está vazio. Adicione itens antes de finalizar a compra.",
            );
            return;
          }
          speakMessage("Abrindo diálogo de confirmação.");
          window.dispatchEvent(new CustomEvent("cart:open-checkout-dialog"));
          return;
        }
        speakMessage("Abrindo pedidos.");
        navigate("/checkout");
      },
      confirmCheckout: () => {
        if (location.pathname === "/cart") {
          speakMessage("Confirmando pedido.");
          window.dispatchEvent(new CustomEvent("cart:confirm-checkout"));
          return;
        }
        speakMessage("Este comando funciona na tela do carrinho.");
      },
      openOrder: (orderId: string) => {
        const normalizedOrderId = String(orderId ?? "").trim();
        if (!normalizedOrderId) {
          speakMessage("Não entendi o número do pedido.");
          return;
        }
        const parsedHistory = safeParseJson<Order[]>(
          localStorage.getItem("orderHistory"),
          [],
        );
        const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        const foundOrder = orderHistory.find(
          (order) => Number(order.id) === Number(normalizedOrderId),
        );
        if (foundOrder) {
          speakMessage(`Pedido ${normalizedOrderId} encontrado. Abrindo detalhes.`);
          navigate(`/checkout?orderId=${encodeURIComponent(normalizedOrderId)}`);
          return;
        }
        speakMessage(`Não encontrei o pedido ${normalizedOrderId} no histórico.`);
        navigate(`/checkout?orderId=${encodeURIComponent(normalizedOrderId)}`);
      },
      openNextOrder: () => {
        openOrderByOffset(1);
      },
      openPreviousOrder: () => {
        openOrderByOffset(-1);
      },
      readOrderDetails: (orderIdFromCommand: string | null) => {
        if (location.pathname !== "/checkout") {
          speakMessage("Abra a tela de pedidos para ouvir os dados do pedido.");
          return;
        }
        const latestOrder = safeParseJson<Order | null>(
          sessionStorage.getItem("latestOrderSummary"),
          null,
        );
        const parsedHistory = safeParseJson<Order[]>(
          localStorage.getItem("orderHistory"),
          [],
        );
        const orderHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        const requestedOrderFromRoute = new URLSearchParams(location.search).get(
          "orderId",
        );
        const requestedOrderId =
          String(orderIdFromCommand ?? "").trim() || requestedOrderFromRoute || "";
        const selectedOrder = requestedOrderId
          ? orderHistory.find(
              (order) => Number(order.id) === Number(requestedOrderId),
            )
          : latestOrder || orderHistory[0];
        if (!selectedOrder) {
          speakMessage("Não há dados de pedido para leitura no momento.");
          return;
        }
        setFeedback(`Lendo dados do pedido ${selectedOrder.id}.`);
        speak(buildOrderDetailsSpeech(selectedOrder));
      },
      goBack: () => navigate(-1),
      openHome: () => navigate("/home"),
      ...(isBookDetailsRoute && currentDetailBook
        ? {
            addCurrentBookToCart: () => {
              addToCart(currentDetailBook.id);
            },
            readTitle: () => {
              if (currentDetailBook.title) {
                setFeedback("Lendo título do livro.");
                speak(`O título é ${currentDetailBook.title}.`);
              }
            },
            readDescription: () => {
              if (currentDetailBook.description) {
                setFeedback("Lendo descrição do livro.");
                speak(currentDetailBook.description);
              }
            },
          }
        : {}),
      onTitleUnavailable: () => {
        speakMessage("Abra os detalhes de um livro para ouvir o título.");
      },
      onDescriptionUnavailable: () => {
        speakMessage("Abra os detalhes de um livro para ouvir a descrição.");
      },
      onUnknown: () => {
        setFeedback("Comando não reconhecido. Tente novamente.");
      },
    }),
    [
      addToCart,
      clearCart,
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
      setFeedback,
      speak,
      speakMessage,
    ],
  );

  const commands = useVoiceCommands({
    pathname: location.pathname,
    voiceActions,
    setFeedback,
    setVoiceError,
    speakMessage,
    speak,
    cancel,
  });

  return {
    feedback,
    feedbackSeverity,
    voiceError,
    isSpeaking,
    ...commands,
    pathname: location.pathname,
  };
}
