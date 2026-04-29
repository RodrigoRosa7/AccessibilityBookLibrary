import type { Order } from "../../../types";

export function formatMoneyForSpeech(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function buildOrderDetailsSpeech(order: Order): string {
  const itemsText =
    Array.isArray(order?.items) && order.items.length > 0
      ? order.items
          .map((item) => `${item.title}, quantidade ${item.quantity}`)
          .join(". ")
      : "Sem itens registrados.";
  return `Pedido número ${order?.id}. Total ${formatMoneyForSpeech(order?.total)}. Itens: ${itemsText}.`;
}
