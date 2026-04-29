export type BookId = number;

export interface Book {
  id: BookId;
  title: string;
  author: string;
  description: string;
  price: number;
}

export interface BookSearchResponse {
  books: Book[];
}

export interface BookDetailsResponse {
  book: Book;
}
