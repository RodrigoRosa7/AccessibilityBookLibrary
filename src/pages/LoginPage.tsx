import { Text, TextInput } from "@primer/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { loginWithEmailPassword } from "../features/auth/authService";
import { AppButton } from "../shared/ui/AppButton";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("ana@librarybooks.com");
  const [password, setPassword] = useState("f@cR9oPVAh");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginWithEmailPassword({ email, password });
      login(user);
      navigate("/home");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Erro ao entrar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-4)",
        background: "var(--color-bg)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 480,
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-md)",
          display: "grid",
          gap: "var(--space-5)",
        }}
      >
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              lineHeight: "var(--leading-tight)",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Livraria de Voz
          </h1>
          <Text as="p" style={{ color: "var(--color-muted)", margin: 0 }}>
            Use um usuário de teste para acessar o catálogo com comandos de voz.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "var(--space-3)" }}
        >
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label
              htmlFor="email-input"
              style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}
            >
              E-mail
            </label>
            <TextInput
              id="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              block
              required
              aria-label="Campo de e-mail"
            />
          </div>

          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label
              htmlFor="password-input"
              style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}
            >
              Senha
            </label>
            <TextInput
              id="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              block
              required
              aria-label="Campo de senha"
            />
          </div>

          {error ? (
            <p
              role="alert"
              style={{
                color: "var(--color-danger)",
                margin: 0,
                fontSize: "var(--text-sm)",
              }}
            >
              {error}
            </p>
          ) : null}

          <AppButton
            type="submit"
            variant="primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "var(--space-1)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </AppButton>
        </form>
      </section>
    </div>
  );
}
