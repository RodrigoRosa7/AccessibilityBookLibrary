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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginWithEmailPassword({ email, password });
      login(user);
      navigate("/home");
    } catch (submitError) {
      setError(submitError.message);
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
        <Heading as="h1" sx={{ mb: 2 }}>
          Entrar na Braille Bookstore
        </Heading>
        <Text as="p" sx={{ color: "var(--color-muted)", mb: 3 }}>
          Use um usuário de teste para acessar o catálogo com comandos de voz.
        </Text>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <Text as="label" htmlFor="email-input">
              E-mail
            </Text>
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
            <Text as="label" htmlFor="password-input">
              Senha
            </Text>
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
            <Text as="p" sx={{ color: "var(--color-danger)" }}>
              {error}
            </Text>
          ) : null}

          <Button
            className="app-button-primary"
            type="submit"
            variant="primary"
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-bg)",
              borderColor: "var(--color-primary)",
              "&:hover:not(:disabled)": {
                backgroundColor: "var(--color-primary-strong)",
                borderColor: "var(--color-primary-strong)",
              },
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
