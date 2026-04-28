import type { Book, BookId } from "./book";

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface OrderItemSummary {
  bookId: BookId;
  title: string;
  author: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  createdAt: string;
  items: OrderItemSummary[];
  total: number;
}

export type OrderSummary = Order;
