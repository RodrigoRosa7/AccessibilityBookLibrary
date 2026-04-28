import type { BookId } from "./book";

export interface CartItem {
  id: string;
  bookId: BookId;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface OrderItemSummary {
  title: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  createdAt: string;
  items: OrderItemSummary[];
  total: number;
}

export type OrderSummary = Order;
