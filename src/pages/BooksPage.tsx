import { Heading, Text, TextInput } from "@primer/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../app/providers/CartProvider";
import { getSearchResultsSummaryMessage } from "../features/voice/searchResultsSpeech";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis";
import { BookCard } from "../features/books/BookCard";
import { BookCardSkeleton } from "../features/books/BookCardSkeleton";
import { getBooks } from "../features/books/bookService";
import { AppButton } from "../shared/ui/AppButton";
import type { Book } from "../types";

const SKELETON_COUNT = 6;

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, addToCart, decreaseFromCart } = useCart();
  const { speak } = useSpeechSynthesis();

  const query = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const announcedSearchSummaryRef = useRef("");

  const cartQuantitiesByBookId = useMemo(() => {
    const quantityMap = new Map<number, number>();
    items.forEach((item) => {
      quantityMap.set(item.bookId, item.quantity);
    });
    return quantityMap;
  }, [items]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const result = await getBooks(query);
        if (active) {
          setBooks(result);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Erro ao carregar livros.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      active = false;
    };
  }, [query, retryCount]);

  const searchSummary = useMemo(() => {
    if (!query || loading || error) {
      return "";
    }

    return getSearchResultsSummaryMessage({
      total: books.length,
      query,
    });
  }, [books.length, error, loading, query]);

  useEffect(() => {
    if (!query) {
      announcedSearchSummaryRef.current = "";
      return;
    }

    if (!searchSummary || announcedSearchSummaryRef.current === searchSummary) {
      return;
    }

    announcedSearchSummaryRef.current = searchSummary;
    speak(searchSummary);
  }, [query, searchSummary, speak]);

  return (
    <section className="app-stack">
      <div className="app-header-row">
        <Heading as="h2">Catálogo de Livros</Heading>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const normalizedQuery = searchInput.trim();

          if (!normalizedQuery) {
            setSearchParams({});
            return;
          }

          setSearchParams({ q: normalizedQuery });
        }}
        className="app-actions-row"
      >
        <TextInput
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por título, autor ou descrição"
          aria-label="Buscar livros"
          style={{ minWidth: 260, flex: 1 }}
        />
        <AppButton type="submit" variant="primary">
          Buscar
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => {
            setSearchInput("");
            setSearchParams({});
          }}
        >
          Limpar
        </AppButton>
      </form>

      {error ? (
        <div className="app-stack-sm">
          <Text style={{ color: "var(--color-danger)" }}>{error}</Text>
          <AppButton
            variant="secondary"
            onClick={() => setRetryCount((c) => c + 1)}
            style={{ alignSelf: "flex-start" }}
          >
            Tentar novamente
          </AppButton>
        </div>
      ) : null}

      {searchSummary ? (
        <Text style={{ color: "var(--color-muted)" }}>{searchSummary}</Text>
      ) : null}

      {loading ? (
        <div className="app-books-grid" aria-label="Carregando livros..." aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!loading && !error && books.length === 0 ? (
        <Text style={{ color: "var(--color-muted)" }}>
          Nenhum livro encontrado para a busca informada.
        </Text>
      ) : null}

      {!loading && !error ? (
        <div className="app-books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              quantityInCart={cartQuantitiesByBookId.get(book.id) ?? 0}
              onAddToCart={(bookId) => {
                addToCart(bookId);
                speak("Livro adicionado ao carrinho.");
              }}
              onIncreaseQuantity={(bookId) => {
                addToCart(bookId);
              }}
              onDecreaseQuantity={(bookId, quantityInCart) => {
                decreaseFromCart(bookId);
                if (quantityInCart <= 1) {
                  speak("Livro removido do carrinho.");
                }
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
