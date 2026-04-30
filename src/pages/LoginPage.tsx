import { Button, Heading, Text, TextInput } from "@primer/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { loginWithEmailPassword } from "../features/auth/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("ana@braillebooks.com");
  const [password, setPassword] = useState("123456");
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
        padding: 16,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 460,
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Heading as="h1" style={{ marginBottom: 8 }}>
          Entrar na Braille Bookstore
        </Heading>
        <Text as="p" style={{ color: "var(--color-muted)", marginBottom: 16 }}>
          Use um usuário de teste para acessar o catálogo com comandos de voz.
        </Text>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label htmlFor="email-input">E-mail</label>
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

          <div>
            <label htmlFor="password-input">Senha</label>
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
            <p style={{ color: "var(--color-danger)", margin: 0 }}>{error}</p>
          ) : null}

          <Button
            className="app-button-primary"
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
