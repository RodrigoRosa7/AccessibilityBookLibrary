import { apiPost } from "../../shared/lib/api/apiClient";
import type { BookId, Order } from "../../types";

interface CheckoutPayload {
  userId: string | number;
  items: { id: string; bookId: BookId; quantity: number }[];
  total: number;
}

interface CheckoutApiResponse {
  order: { id: number };
}

const ORDER_HISTORY_KEY = "orderHistory";
const LATEST_ORDER_KEY = "latestOrderSummary";
const MAX_ORDER_HISTORY = 8;

export async function submitCheckout(
  payload: CheckoutPayload,
): Promise<{ id: number }> {
  const response = await apiPost<CheckoutPayload, CheckoutApiResponse>(
    "/checkout",
    payload,
  );
  return response.order;
}

export function getOrderHistory(): Order[] {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrderToHistory(order: Order): void {
  try {
    const existing = getOrderHistory();
    const next = [order, ...existing].slice(0, MAX_ORDER_HISTORY);
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures to avoid blocking the checkout flow.
  }
}

export function getLatestOrderSummary(): Order | null {
  try {
    const raw = sessionStorage.getItem(LATEST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

export function saveLatestOrderSummary(order: Order): void {
  try {
    sessionStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Ignore storage failures.
  }
}
