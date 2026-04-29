import { apiPost } from "../../services/apiClient";

export async function createOrder(payload) {
  const response = await apiPost("/checkout", payload);
  return response.order;
}
