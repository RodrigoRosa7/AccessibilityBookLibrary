import { Button, Heading, Spinner, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../app/providers/CartProvider.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { useSpeechSynthesis } from "../voice/useSpeechSynthesis.js";
import { getBookById } from "./bookService.js";

export function BookDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { speak } = useSpeechSynthesis();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBook() {
      setLoading(true);
      setError("");

      try {
        const result = await getBookById(id);
        if (active) {
          setBook(result);
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
      <Text sx={{ color: "danger.fg" }}>{error || "Livro não encontrado"}</Text>
    );
  }

  return (
    <section className="app-surface-card app-stack-sm">
      <div className="app-header-row">
        <Heading as="h2">{book.title}</Heading>
      </div>

      <Text as="p" sx={{ color: "fg.muted" }}>
        {book.author}
      </Text>
      <Text as="p">{book.description}</Text>
      <Text as="p">Formato: {book.format}</Text>
      <Text as="strong">{formatCurrency(book.price)}</Text>

      <div className="app-actions-row">
        <Button
          onClick={() => speak(book.description)}
          aria-label="Ler descrição do livro em voz alta"
        >
          Ler descrição
        </Button>
        <Button
          variant="primary"
          onClick={addCurrentBookToCart}
          aria-label="Adicionar livro ao carrinho"
        >
          Adicionar ao carrinho
        </Button>
        <Button
          onClick={() => navigate(-1)}
          aria-label="Voltar para tela anterior"
        >
          Voltar
        </Button>
      </div>
    </section>
  );
}
