import type { User } from "../types";

type MockUser = User & { password: string };

export const usersMock: MockUser[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana@librarybooks.com",
    password: "f@cR9oPVAh",
  },
  {
    id: 2,
    name: "Carlos Souza",
    email: "carlos@librarybooks.com",
    password: "f@cR9oPVAh",
  },
  {
    id: 3,
    name: "Marina Oliveira",
    email: "marina@librarybooks.com",
    password: "f@cR9oPVAh",
  },
];
