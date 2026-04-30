import type { User } from "../types";

type MockUser = User & { password: string };

export const usersMock: MockUser[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana@braillebooks.com",
    password: "123456",
  },
  {
    id: 2,
    name: "Carlos Souza",
    email: "carlos@braillebooks.com",
    password: "123456",
  },
  {
    id: 3,
    name: "Marina Oliveira",
    email: "marina@braillebooks.com",
    password: "123456",
  },
];
