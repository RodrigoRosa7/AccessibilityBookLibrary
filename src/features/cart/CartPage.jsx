import { Button, Heading, Spinner, Text } from "@primer/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider.jsx";
import { useCart } from "../../app/providers/CartProvider.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { useSpeechSynthesis } from "../voice/useSpeechSynthesis.js";
import { getBooks } from "../books/bookService.js";
import { createOrder } from "./cartService.js";

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, clearCart } = useCart();
  const { speak } = useSpeechSynthesis();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const result = await getBooks();
        if (active) {
          setCatalog(result);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const detailedItems = useMemo(() => {
    return items
      .map((item) => {
        const book = catalog.find((entry) => entry.id === item.bookId);
        if (!book) {
          return null;
        }

        return {
          ...item,
          book,
          subtotal: book.price * item.quantity,
        };
      })
      .filter(Boolean);
  }, [items, catalog]);

  const total = useMemo(
    () => detailedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [detailedItems],
  );

  const handleCheckout = useCallback(async () => {
    if (!user || detailedItems.length === 0) {
      return;
    }

    setIsSubmittingOrder(true);
    setOrderMessage("");

    try {
      const order = await createOrder({
        userId: user.id,
        items: detailedItems.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          quantity: item.quantity,
        })),
        total,
      });

      clearCart();
      setIsCheckoutDialogOpen(false);
      const message = `Pedido #${order.id} confirmado com sucesso.`;
      setOrderMessage(message);
      speak(message);

      const orderSummary = {
        id: order.id,
        total,
        createdAt: new Date().toISOString(),
        items: detailedItems.map((item) => ({
          title: item.book.title,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      };

      sessionStorage.setItem(
        "latestOrderSummary",
        JSON.stringify(orderSummary),
      );

      try {
        const rawHistory = localStorage.getItem("orderHistory");
        const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
        const safeHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
        const nextHistory = [orderSummary, ...safeHistory].slice(0, 8);
        localStorage.setItem("orderHistory", JSON.stringify(nextHistory));
      } catch {
        // Ignore local storage failures to avoid blocking checkout flow.
      }

      navigate("/checkout", { state: { orderSummary } });
    } catch (checkoutError) {
      const message = checkoutError.message ?? "Erro ao finalizar o pedido.";
      setOrderMessage(message);
      speak(message);
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [user, detailedItems, total, clearCart, speak, navigate]);

  useEffect(() => {
    function closeCheckoutDialog() {
      setIsCheckoutDialogOpen(false);
    }

    function openCheckoutDialog() {
      setIsCheckoutDialogOpen(true);
    }

    function handleConfirmCheckout() {
      handleCheckout();
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        closeCheckoutDialog();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("app-modal:close", closeCheckoutDialog);
    window.addEventListener("cart:open-checkout-dialog", openCheckoutDialog);
    window.addEventListener("cart:confirm-checkout", handleConfirmCheckout);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("app-modal:close", closeCheckoutDialog);
      window.removeEventListener(
        "cart:open-checkout-dialog",
        openCheckoutDialog,
      );
      window.removeEventListener(
        "cart:confirm-checkout",
        handleConfirmCheckout,
      );
    };
  }, [handleCheckout]);

  if (loading) {
    return <Spinner size="large" aria-label="Carregando carrinho" />;
  }

  return (
    <section className="app-stack">
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
        {orderMessage}
      </div>

      <div className="app-header-row">
        <Heading as="h2">Carrinho</Heading>
      </div>

      {orderMessage ? (
        <Text sx={{ color: "var(--color-primary-strong)" }}>
          {orderMessage}
        </Text>
      ) : null}

      {detailedItems.length === 0 ? (
        <div className="app-surface-card app-surface-card-muted">
          <Text>Seu carrinho está vazio.</Text>
        </div>
      ) : (
        detailedItems.map((item) => (
          <div key={item.id} className="app-surface-card app-header-row">
            <div>
              <Heading as="h3" sx={{ fontSize: 2 }}>
                {item.book.title}
              </Heading>
              <Text as="p" sx={{ color: "var(--color-muted)" }}>
                Quantidade: {item.quantity}
              </Text>
              <Text as="strong">Subtotal: {formatCurrency(item.subtotal)}</Text>
            </div>
            <Button
              className="app-button-primary"
              onClick={() => {
                removeFromCart(item.bookId);
                speak(`${item.book.title} removido do carrinho.`);
              }}
              aria-label={`Remover ${item.book.title} do carrinho`}
            >
              Remover
            </Button>
          </div>
        ))
      )}

      <div className="app-surface-card app-stack-sm">
        <Text as="strong">Total: {formatCurrency(total)}</Text>
        <div className="app-actions-row">
          <Button
            className="app-button-primary"
            onClick={() => navigate("/books")}
          >
            Continuar comprando
          </Button>
          <Button
            className="app-button-primary"
            variant="primary"
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-bg)",
              borderColor: "var(--color-primary)",
              "&:hover:not(:disabled)": {
                backgroundColor: "var(--color-primary-strong)",
                borderColor: "var(--color-primary-strong)",
              },
            }}
            onClick={() => setIsCheckoutDialogOpen(true)}
            disabled={detailedItems.length === 0}
          >
            Finalizar compra
          </Button>
        </div>
      </div>

      {isCheckoutDialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="app-dialog-overlay"
          style={{ zIndex: 1200 }}
          onClick={() => setIsCheckoutDialogOpen(false)}
        >
          <div
            className="app-dialog-card"
            style={{ maxWidth: 520 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Heading as="h3" id="checkout-modal-title" sx={{ fontSize: 2 }}>
              Confirmar pedido
            </Heading>
            <Text>
              Deseja finalizar o pedido no valor total de{" "}
              {formatCurrency(total)}?
            </Text>
            <div
              className="app-actions-row"
              style={{ justifyContent: "flex-end" }}
            >
              <Button
                className="app-button-primary"
                onClick={() => setIsCheckoutDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="app-button-primary"
                variant="primary"
                sx={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-bg)",
                  borderColor: "var(--color-primary)",
                  "&:hover:not(:disabled)": {
                    backgroundColor: "var(--color-primary-strong)",
                    borderColor: "var(--color-primary-strong)",
                  },
                }}
                onClick={handleCheckout}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? "Processando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
