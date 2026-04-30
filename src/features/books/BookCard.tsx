import { Button, Heading, Text } from "@primer/react";
import { useNavigate } from "react-router-dom";
import type { Book, BookId } from "../../types";
import { formatCurrency } from "../../shared/lib/currency";

interface BookCardProps {
  book: Book;
  onAddToCart: (bookId: BookId) => void;
  onIncreaseQuantity: (bookId: BookId) => void;
  onDecreaseQuantity: (bookId: BookId, quantityInCart: number) => void;
  quantityInCart?: number;
}

export function BookCard({
  book,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  quantityInCart = 0,
}: BookCardProps) {
  const navigate = useNavigate();
  const isInCart = quantityInCart > 0;

  return (
    <article
      className="catalog-book-card"
      style={{
        padding: 16,
        display: "grid",
        gap: 12,
        minHeight: 220,
      }}
    >
      <div>
        <Heading as="h3" style={{ fontSize: 16 }}>
          {book.title}
        </Heading>
        <Text as="p" style={{ color: "var(--color-muted)" }}>
          {book.author}
        </Text>
      </div>

      <Text as="p">{book.description}</Text>

      <div style={{ display: "grid", gap: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <strong>{formatCurrency(book.price)}</strong>
          <Text as="p" style={{ color: "var(--color-muted)", fontSize: "12px" }}>
            No carrinho: {quantityInCart}
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Button
            className="interactive-button app-button-primary"
            onClick={() => navigate(`/books/${book.id}`)}
            aria-label={`Ver detalhes de ${book.title}`}
          >
            Detalhes
          </Button>

          {isInCart ? (
            <div
              className="book-quantity-controls"
              role="group"
              aria-label={`Quantidade de ${book.title} no carrinho`}
            >
              <button
                type="button"
                className="interactive-button quantity-step-button"
                onClick={() => onDecreaseQuantity(book.id, quantityInCart)}
                aria-label={`Diminuir quantidade de ${book.title}`}
              >
                -
              </button>
              <output
                className="book-quantity-value"
                aria-live="polite"
                aria-atomic="true"
              >
                {quantityInCart}
              </output>
              <button
                type="button"
                className="interactive-button quantity-step-button"
                onClick={() => onIncreaseQuantity(book.id)}
                aria-label={`Aumentar quantidade de ${book.title}`}
              >
                +
              </button>
            </div>
          ) : (
            <Button
              className="interactive-button app-button-primary"
              variant="primary"
              onClick={() => onAddToCart(book.id)}
              aria-label={`Adicionar ${book.title} ao carrinho`}
            >
              Adicionar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
