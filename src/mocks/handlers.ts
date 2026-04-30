import { delay, http, HttpResponse } from "msw";
import { booksMock } from "./booksMock";
import { usersMock } from "./usersMock";

const API_BASE = `${import.meta.env.BASE_URL}api`;

interface MockOrder {
  id: number;
  userId: number;
  items: unknown[];
  total: number;
  status: string;
}

const ordersMock: MockOrder[] = [];

function createOrderId(): number {
  return ordersMock.length + 1;
}

function normalizeSearchText(text: unknown): string {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export const handlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "").trim();

    const matchedUser = usersMock.find(
      (user) =>
        user.email.toLowerCase() === email && user.password === password,
    );

    if (!matchedUser) {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const { password: _password, ...safeUser } = matchedUser;

    return HttpResponse.json({ user: safeUser }, { status: 200 });
  }),

  http.get(`${API_BASE}/books`, async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    if (!query) {
      return HttpResponse.json({ books: booksMock }, { status: 200 });
    }

    const normalizedQuery = normalizeSearchText(query);
    const filteredBooks = booksMock.filter((book) => {
      const searchableContent = normalizeSearchText(
        `${book.title} ${book.author} ${book.description}`,
      );
      return searchableContent.includes(normalizedQuery);
    });

    return HttpResponse.json({ books: filteredBooks }, { status: 200 });
  }),

  http.get(`${API_BASE}/books/:id`, async ({ params }) => {
    await delay(180);

    const id = Number(params.id);
    const book = booksMock.find((item) => item.id === id);

    if (!book) {
      return HttpResponse.json({ message: "Book not found" }, { status: 404 });
    }

    return HttpResponse.json({ book }, { status: 200 });
  }),

  http.post(`${API_BASE}/checkout`, async ({ request }) => {
    await delay(350);

    const body = (await request.json()) as Record<string, unknown>;
    const userId = Number(body.userId);
    const items = Array.isArray(body.items) ? body.items : [];
    const total = Number(body.total ?? 0);

    if (!userId || items.length === 0 || total <= 0) {
      return HttpResponse.json(
        { message: "Invalid order payload" },
        { status: 400 },
      );
    }

    const order: MockOrder = {
      id: createOrderId(),
      userId,
      items,
      total,
      status: "confirmed",
    };

    ordersMock.push(order);

    return HttpResponse.json({ order }, { status: 201 });
  }),
];
