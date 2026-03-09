import { apiPost } from "../../services/apiClient.js";

export async function loginWithEmailPassword(credentials) {
  const response = await apiPost("/auth/login", credentials);
  return response.user;
}
