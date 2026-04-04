import { Heading, Text } from "@primer/react";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency.js";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderSummary = useMemo(() => {
    const fromNavigation = location.state?.orderSummary;
    if (fromNavigation) {
      return fromNavigation;
    }

    try {
      const cachedOrder = sessionStorage.getItem("latestOrderSummary");
      return cachedOrder ? JSON.parse(cachedOrder) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const orderHistory = useMemo(() => {
    try {
      const rawHistory = localStorage.getItem("orderHistory");
      const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
      return Array.isArray(parsedHistory) ? parsedHistory : [];
    } catch {
      return [];
    }
  }, []);

  const requestedOrderId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = Number(params.get("orderId"));
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [location.search]);

  const ordersForMenu = useMemo(() => {
    const normalizedHistory = Array.isArray(orderHistory) ? orderHistory : [];

    if (!orderSummary) {
      return normalizedHistory;
    }

    const alreadyExists = normalizedHistory.some(
      (item) => Number(item.id) === Number(orderSummary.id),
    );

    return alreadyExists
      ? normalizedHistory
      : [orderSummary, ...normalizedHistory];
  }, [orderHistory, orderSummary]);

  const displayedOrder = useMemo(() => {
    if (requestedOrderId) {
      const selected = ordersForMenu.find(
        (item) => Number(item.id) === requestedOrderId,
      );

      if (selected) {
        return selected;
      }
    }

    return orderSummary ?? ordersForMenu[0] ?? null;
  }, [orderSummary, ordersForMenu, requestedOrderId]);

  const requestedOrder = useMemo(() => {
    if (!requestedOrderId) {
      return null;
    }

    return (
      ordersForMenu.find((item) => Number(item.id) === requestedOrderId) ?? null
    );
  }, [ordersForMenu, requestedOrderId]);

  const shouldShowOrderModal = Boolean(requestedOrderId && requestedOrder);

  const requestedOrderNotFound = Boolean(requestedOrderId && !requestedOrder);

  const closeOrderModal = () => {
    navigate("/checkout", { replace: true, state: location.state });
  };

  useEffect(() => {
    function handleKeydown(event) {
      if (event.key === "Escape") {
        closeOrderModal();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("app-modal:close", closeOrderModal);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("app-modal:close", closeOrderModal);
    };
  }, [location.state, navigate]);

  return (
    <section
      style={{
        border: "1px solid #d0d7de",
        borderRadius: 8,
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      <Heading as="h2" sx={{ mb: 2 }}>
        Checkout
      </Heading>

      {requestedOrderNotFound ? (
        <div
          style={{
            border: "1px solid #d1242f",
            borderRadius: 8,
            padding: 12,
            background: "#ffebe9",
          }}
        >
          <Text as="p" sx={{ color: "danger.fg" }}>
            Não encontrei o pedido #{requestedOrderId}. Verifique o número
            informado.
          </Text>
        </div>
      ) : null}

      {displayedOrder ? (
        <>
          <div
            style={{
              border: "1px solid #2da44e",
              background: "#dafbe1",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text as="p" sx={{ fontWeight: "bold" }}>
              Pedido #{displayedOrder.id} confirmado com sucesso.
            </Text>
            <Text as="p" sx={{ color: "fg.muted" }}>
              Data: {new Date(displayedOrder.createdAt).toLocaleString("pt-BR")}
            </Text>
          </div>

          <div
            style={{
              border: "1px solid #d0d7de",
              borderRadius: 8,
              padding: 12,
              display: "grid",
              gap: 8,
            }}
          >
            <Heading as="h3" sx={{ fontSize: 2 }}>
              Itens do pedido
            </Heading>

            {displayedOrder.items?.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  borderTop: index === 0 ? "none" : "1px solid #d8dee4",
                  paddingTop: index === 0 ? 0 : 8,
                }}
              >
                <Text as="p">
                  {item.title} x {item.quantity}
                </Text>
                <Text as="strong">{formatCurrency(item.subtotal)}</Text>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #d8dee4", paddingTop: 8 }}>
              <Text as="strong">
                Total pago: {formatCurrency(displayedOrder.total)}
              </Text>
            </div>
          </div>

          {ordersForMenu.length > 0 ? (
            <div
              style={{
                border: "1px solid #d0d7de",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <details>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  Últimos pedidos
                </summary>

                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {ordersForMenu.map((historyOrder) => {
                    const isSelected =
                      Number(displayedOrder?.id) === Number(historyOrder.id);

                    return (
                      <button
                        key={`${historyOrder.id}-${historyOrder.createdAt}`}
                        type="button"
                        className="interactive-button"
                        style={{
                          border: isSelected
                            ? "1px solid #0969da"
                            : "1px solid #d0d7de",
                          background: isSelected ? "#ddf4ff" : "#ffffff",
                          borderRadius: 8,
                          padding: 10,
                          textAlign: "left",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          navigate(`/checkout?orderId=${historyOrder.id}`);
                        }}
                      >
                        <span>
                          Pedido #{historyOrder.id} -{" "}
                          {new Date(historyOrder.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                        <strong>{formatCurrency(historyOrder.total)}</strong>
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>
          ) : null}
        </>
      ) : (
        <div
          style={{ border: "1px solid #d0d7de", borderRadius: 8, padding: 12 }}
        >
          <Text as="p" sx={{ color: "fg.muted" }}>
            Nenhum pedido recente encontrado. Finalize uma compra no carrinho
            para ver o resumo aqui.
          </Text>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="interactive-button cart-indicator-button"
          onClick={() => navigate("/books")}
        >
          Continuar comprando
        </button>
        <button
          type="button"
          className="interactive-button cart-indicator-button"
          onClick={() => navigate("/cart")}
        >
          Voltar ao carrinho
        </button>
      </div>

      {shouldShowOrderModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1300,
          }}
          onClick={closeOrderModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              border: "1px solid #d0d7de",
              borderRadius: 12,
              background: "#ffffff",
              padding: 16,
              display: "grid",
              gap: 10,
              boxShadow: "0 28px 60px rgba(15, 23, 42, 0.32)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Heading as="h3" id="order-modal-title" sx={{ fontSize: 3 }}>
              Pedido #{requestedOrder.id}
            </Heading>

            <Text as="p" sx={{ color: "fg.muted" }}>
              Data: {new Date(requestedOrder.createdAt).toLocaleString("pt-BR")}
            </Text>

            <div
              style={{
                border: "1px solid #d8dee4",
                borderRadius: 8,
                padding: 10,
                display: "grid",
                gap: 8,
              }}
            >
              {requestedOrder.items?.map((item, index) => (
                <div
                  key={`${item.title}-modal-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    borderTop: index === 0 ? "none" : "1px solid #d8dee4",
                    paddingTop: index === 0 ? 0 : 8,
                  }}
                >
                  <Text as="p">
                    {item.title} x {item.quantity}
                  </Text>
                  <Text as="strong">{formatCurrency(item.subtotal)}</Text>
                </div>
              ))}
            </div>

            <Text as="strong">
              Total do pedido: {formatCurrency(requestedOrder.total)}
            </Text>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="interactive-button cart-indicator-button"
                onClick={closeOrderModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
