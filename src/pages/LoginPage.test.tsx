import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axe from "axe-core";
import { LoginPage } from "./LoginPage";
import { AuthProvider } from "../app/providers/AuthProvider";

vi.mock("../features/auth/authService", () => ({
  loginWithEmailPassword: vi.fn(),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginPage accessibility", () => {
  it("has no axe violations in default state", async () => {
    const { container } = render(<LoginPage />, { wrapper: Wrapper });
    const results = await axe.run(container);
    if (results.violations.length > 0) {
      console.error(
        "Axe violations:",
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            description: v.description,
            nodes: v.nodes.map((n) => n.html),
          })),
          null,
          2,
        ),
      );
    }
    expect(results.violations).toHaveLength(0);
  });
});
