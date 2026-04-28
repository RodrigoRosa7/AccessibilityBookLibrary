import { apiPost } from "../../services/apiClient";
import type { AuthCredentials, AuthResponse, User } from "../../types";

export async function loginWithEmailPassword(
  credentials: AuthCredentials,
): Promise<User> {
  const response = await apiPost<AuthCredentials, AuthResponse>(
    "/auth/login",
    credentials,
  );
  return response.user;
}
