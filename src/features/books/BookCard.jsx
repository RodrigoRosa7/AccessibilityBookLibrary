import { Button, Heading, Text } from "@primer/react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency.js";

export function BookCard({
  book,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  quantityInCart = 0,
}) {
  const navigate = useNavigate();
  const isInCart = quantityInCart > 0;

  return (
    <article
      style={{
        border: "1px solid #d0d7de",
        borderRadius: 8,
        padding: 16,
        display: "grid",
        gap: 12,
        minHeight: 220,
      }}
    >
      <div>
        <Heading as="h3" sx={{ fontSize: 2 }}>
          {book.title}
        </Heading>
        <Text as="p" sx={{ color: "fg.muted" }}>
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
          <Text as="strong">{formatCurrency(book.price)}</Text>
          <Text as="p" sx={{ color: "fg.muted", fontSize: 0 }}>
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
            className="interactive-button"
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
              className="interactive-button"
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
