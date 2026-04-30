import { Heading, Text } from "@primer/react";
import { AppButton } from "../shared/ui/AppButton";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../shared/lib/currency";
import {
  getOrderHistory,
  getLatestOrderSummary,
} from "../features/cart/cartService";
import {
  subscribeVoiceEvent,
  VOICE_EVENT,
} from "../features/voice/services/voiceEvents";
import type { Order } from "../types";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderSummary = useMemo<Order | null>(() => {
    return (
      (location.state as { orderSummary?: Order } | null)?.orderSummary ??
      getLatestOrderSummary()
    );
  }, [location.state]);

  const orderHistory = useMemo(() => getOrderHistory(), []);

  const requestedOrderId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = Number(params.get("orderId"));
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [location.search]);

  const ordersForMenu = useMemo<Order[]>(() => {
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

  const displayedOrder = useMemo<Order | null>(() => {
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

  const requestedOrder = useMemo<Order | null>(() => {
    if (!requestedOrderId) {
      return null;
    }

    return (
      ordersForMenu.find((item) => Number(item.id) === requestedOrderId) ?? null
    );
  }, [ordersForMenu, requestedOrderId]);

  const shouldShowOrderModal = Boolean(requestedOrderId && requestedOrder);
  const requestedOrderNotFound = Boolean(requestedOrderId && !requestedOrder);

  const closeOrderModal = useCallback(() => {
    navigate("/checkout", { replace: true, state: location.state });
  }, [navigate, location.state]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeOrderModal();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    const unsubClose = subscribeVoiceEvent(
      VOICE_EVENT.MODAL_CLOSE,
      closeOrderModal,
    );

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      unsubClose();
    };
  }, [closeOrderModal]);

  return (
    <section className="app-surface-card app-stack-sm">
      <Heading as="h2" style={{ marginBottom: 8 }}>
        Pedidos
      </Heading>

      {requestedOrderNotFound ? (
        <div className="app-status-banner app-status-banner-critical">
          <Text as="p" style={{ color: "var(--color-danger)" }}>
            Não encontrei o pedido #{requestedOrderId}. Verifique o número
            informado.
          </Text>
        </div>
      ) : null}

      {displayedOrder ? (
        <>
          <div className="app-status-banner app-status-banner-success">
            <Text as="p" style={{ fontWeight: "bold" }}>
              Pedido #{displayedOrder.id} confirmado com sucesso.
            </Text>
            <Text as="p" style={{ color: "var(--color-muted)" }}>
              Data: {new Date(displayedOrder.createdAt).toLocaleString("pt-BR")}
            </Text>
          </div>

          <div className="app-surface-card app-stack-sm">
            <Heading as="h3" style={{ fontSize: 16 }}>
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
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            ))}

            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: 8,
              }}
            >
              <strong>Total pago: {formatCurrency(displayedOrder.total)}</strong>
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
          <Text as="p" style={{ color: "var(--color-muted)" }}>
            Nenhum pedido recente encontrado. Finalize uma compra no carrinho
            para ver o resumo aqui.
          </Text>
        </div>
      )}

      <div className="app-actions-row">
        <AppButton variant="secondary" onClick={() => navigate("/books")}>
          Continuar comprando
        </AppButton>
        <AppButton variant="secondary" onClick={() => navigate("/cart")}>
          Voltar ao carrinho
        </AppButton>
      </div>

      {shouldShowOrderModal && requestedOrder ? (
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
            <Heading as="h3" id="order-modal-title" style={{ fontSize: 20 }}>
              Pedido #{requestedOrder.id}
            </Heading>

            <Text as="p" style={{ color: "var(--color-muted)" }}>
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
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
            </div>

            <strong>
              Total do pedido: {formatCurrency(requestedOrder.total)}
            </strong>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <AppButton variant="secondary" onClick={closeOrderModal}>
                Fechar
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
