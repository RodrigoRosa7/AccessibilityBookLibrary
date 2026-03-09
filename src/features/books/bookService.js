import { apiGet } from "../../services/apiClient.js";

export async function getBooks(query = "") {
  const search = query ? `?q=${encodeURIComponent(query)}` : "";
  const response = await apiGet(`/books${search}`);
  return response.books ?? [];
}

export async function getBookById(id) {
  const response = await apiGet(`/books/${id}`);
  return response.book;
}
