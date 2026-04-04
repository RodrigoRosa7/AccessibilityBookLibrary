import { Button, Heading, Spinner, Text, TextInput } from "@primer/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider.jsx";
import { getSearchResultsSummaryMessage } from "../voice/searchResultsSpeech.js";
import { useSpeechSynthesis } from "../voice/useSpeechSynthesis.js";
import { BookCard } from "./BookCard.jsx";
import { getBooks } from "./bookService.js";

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, addToCart, decreaseFromCart } = useCart();
  const { speak } = useSpeechSynthesis();

  const query = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(query);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const announcedSearchSummaryRef = useRef("");

  const cartQuantitiesByBookId = useMemo(() => {
    const quantityMap = new Map();

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
          setError(loadError.message);
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
    <section style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
        }}
      >
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
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextInput
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por título, autor ou descrição"
          aria-label="Buscar livros"
          style={{ minWidth: 260, flex: 1 }}
        />
        <Button type="submit" variant="primary">
          Buscar
        </Button>
        <Button
          type="button"
          onClick={() => {
            setSearchInput("");
            setSearchParams({});
          }}
        >
          Limpar
        </Button>
      </form>

      {loading ? <Spinner size="large" srText="Carregando livros" /> : null}
      {error ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text sx={{ color: "danger.fg" }}>{error}</Text>
          <Button
            onClick={() => setRetryCount((c) => c + 1)}
            style={{ alignSelf: "flex-start" }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}
      {searchSummary ? (
        <Text sx={{ color: "fg.muted" }}>{searchSummary}</Text>
      ) : null}
      {!loading && !error && books.length === 0 ? (
        <Text sx={{ color: "fg.muted" }}>
          Nenhum livro encontrado para a busca informada.
        </Text>
      ) : null}

      {!loading && !error ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
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
