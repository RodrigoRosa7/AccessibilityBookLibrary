import type { User } from "../../types";

export const AUTH_DISABLED: boolean =
  import.meta.env.VITE_DISABLE_AUTH === "true";

export const GUEST_USER: User = {
  id: 1,
  name: "Ana Silva",
  email: "ana@librarybooks.com",
};
