import { Heading, Text } from "@primer/react";

export function HomePage() {
  return (
    <section className="app-surface-card app-stack-sm">
      <Heading as="h2" style={{ marginBottom: 8 }}>
        Início
      </Heading>
      <Text as="p" style={{ marginBottom: 8 }}>
        Use navegação por teclado ou voz para explorar o catálogo de livros.
      </Text>
      <div>
        Comandos de exemplo: "abrir livros", "ver carrinho", "finalizar compra".
      </div>
    </section>
  );
}
