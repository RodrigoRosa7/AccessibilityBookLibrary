import { Heading, Spinner, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../app/providers/CartProvider";
import { formatCurrency } from "../shared/lib/currency";
import { useSpeechSynthesis } from "../features/voice/useSpeechSynthesis";
import { getBookById } from "../features/books/bookService";
import { AppButton } from "../shared/ui/AppButton";
import type { Book } from "../types";

export function BookDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { speak } = useSpeechSynthesis();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBook() {
      setLoading(true);
      setError("");

      try {
        const result = await getBookById(id ?? "");
        if (active) {
          setBook(result);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Erro ao carregar detalhes do livro.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBook();
    return () => {
      active = false;
    };
  }, [id]);

  const addCurrentBookToCart = () => {
    if (!book) {
      return;
    }
    addToCart(book.id);
    speak("Livro adicionado ao carrinho.");
  };

  if (loading) {
    return <Spinner size="large" aria-label="Carregando detalhes do livro" />;
  }

  if (error || !book) {
    return (
      <Text style={{ color: "var(--color-danger)" }}>
        {error || "Livro não encontrado"}
      </Text>
    );
  }

  return (
    <section className="app-surface-card app-stack-sm">
      <div className="app-header-row">
        <Heading
          as="h2"
          style={{ fontFamily: "var(--font-serif)", lineHeight: "var(--leading-tight)" }}
        >
          {book.title}
        </Heading>
      </div>

      <Text as="p" style={{ color: "var(--color-muted)" }}>
        {book.author}
      </Text>
      <Text as="p">{book.description}</Text>
      <strong style={{ fontSize: "var(--text-lg)" }}>{formatCurrency(book.price)}</strong>

      <div className="app-actions-row">
        <AppButton
          variant="secondary"
          onClick={() => speak(book.description)}
          aria-label="Ler descrição do livro em voz alta"
        >
          Ler descrição
        </AppButton>
        <AppButton
          variant="primary"
          onClick={addCurrentBookToCart}
          aria-label="Adicionar livro ao carrinho"
        >
          Adicionar ao carrinho
        </AppButton>
        <AppButton
          variant="secondary"
          onClick={() => navigate(-1)}
          aria-label="Voltar para tela anterior"
        >
          Voltar
        </AppButton>
      </div>
    </section>
  );
}
