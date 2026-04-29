import { Heading, Text } from "@primer/react";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import { getOrderHistory, getLatestOrderSummary } from "../cart/cartService";
import { subscribeVoiceEvent, VOICE_EVENT } from "../voice/services/voiceEvents";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderSummary = useMemo(() => {
    return location.state?.orderSummary ?? getLatestOrderSummary();
  }, [location.state]);

  const orderHistory = useMemo(() => getOrderHistory(), []);

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
    const unsubClose = subscribeVoiceEvent(VOICE_EVENT.MODAL_CLOSE, closeOrderModal);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      unsubClose();
    };
  }, [location.state, navigate]);

  return (
    <section className="app-surface-card app-stack-sm">
      <Heading as="h2" sx={{ mb: 2 }}>
        Pedidos
      </Heading>

      {requestedOrderNotFound ? (
        <div className="app-status-banner app-status-banner-critical">
          <Text as="p" sx={{ color: "var(--color-danger)" }}>
            Não encontrei o pedido #{requestedOrderId}. Verifique o número
            informado.
          </Text>
        </div>
      ) : null}

      {displayedOrder ? (
        <>
          <div className="app-status-banner app-status-banner-success">
            <Text as="p" sx={{ fontWeight: "bold" }}>
              Pedido #{displayedOrder.id} confirmado com sucesso.
            </Text>
            <Text as="p" sx={{ color: "var(--color-muted)" }}>
              Data: {new Date(displayedOrder.createdAt).toLocaleString("pt-BR")}
            </Text>
          </div>

          <div className="app-surface-card app-stack-sm">
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
                  borderTop:
                    index === 0 ? "none" : "1px solid var(--color-border)",
                  paddingTop: index === 0 ? 0 : 8,
                }}
              >
                <Text as="p">
                  {item.title} x {item.quantity}
                </Text>
                <Text as="strong">{formatCurrency(item.subtotal)}</Text>
              </div>
            ))}

            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: 8,
              }}
            >
              <Text as="strong">
                Total pago: {formatCurrency(displayedOrder.total)}
              </Text>
            </div>
          </div>

          {ordersForMenu.length > 0 ? (
            <div className="app-surface-card app-stack-sm">
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
                            ? "1px solid var(--color-primary)"
                            : "1px solid var(--color-border)",
                          background: isSelected
                            ? "color-mix(in srgb, var(--color-surface) 70%, var(--color-primary) 30%)"
                            : "var(--color-surface)",
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
        <div className="app-surface-card app-surface-card-muted">
          <Text as="p" sx={{ color: "var(--color-muted)" }}>
            Nenhum pedido recente encontrado. Finalize uma compra no carrinho
            para ver o resumo aqui.
          </Text>
        </div>
      )}

      <div className="app-actions-row">
        <button
          type="button"
          className="interactive-button cart-indicator-button app-button-secondary"
          onClick={() => navigate("/books")}
        >
          Continuar comprando
        </button>
        <button
          type="button"
          className="interactive-button cart-indicator-button app-button-secondary"
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
          className="app-dialog-overlay"
          style={{ zIndex: 1300 }}
          onClick={closeOrderModal}
        >
          <div
            className="app-dialog-card"
            style={{ maxWidth: 560, gap: 10 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Heading as="h3" id="order-modal-title" sx={{ fontSize: 3 }}>
              Pedido #{requestedOrder.id}
            </Heading>

            <Text as="p" sx={{ color: "var(--color-muted)" }}>
              Data: {new Date(requestedOrder.createdAt).toLocaleString("pt-BR")}
            </Text>

            <div
              style={{
                border: "1px solid var(--color-border)",
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
                    borderTop:
                      index === 0 ? "none" : "1px solid var(--color-border)",
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
                className="interactive-button cart-indicator-button app-button-secondary"
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
