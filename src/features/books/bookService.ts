import { apiGet } from "../../shared/lib/api/apiClient";
import type {
  Book,
  BookDetailsResponse,
  BookId,
  BookSearchResponse,
} from "../../types";

export async function getBooks(query: string = ""): Promise<Book[]> {
  const search = query ? `?q=${encodeURIComponent(query)}` : "";
  const response = await apiGet<BookSearchResponse>(`/books${search}`);
  return response?.books ?? [];
}

export async function getBookById(id: BookId | string): Promise<Book> {
  const response = await apiGet<BookDetailsResponse>(`/books/${id}`);
  return response.book;
}
