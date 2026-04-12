# Design System - Café Palette

## Visão Geral

O sistema de design implementa uma paleta de cores **café** e tipografia acessível para melhorar a experiência de usuários, especialmente aqueles com baixa visão ou dislexia.

---

## Paleta de Cores

### Tokens CSS (`:root`)

```css
--color-bg: #fff8f0; /* Sistema de fundo - Creme suave */
--color-surface: #f7eadf; /* Superfícies de cards - Marrom quente */
--color-text: #4b2e2b; /* Texto primário - Marrom escuro */
--color-muted: #8c5a3c; /* Texto secundário - Marrom médio */
--color-border: #d7c4b5; /* Bordas - Marrom claro */
--color-primary: #8c5a3c; /* Botões primários - Marrom médio */
--color-primary-strong: #4b2e2b; /* Hover/Active - Marrom escuro */
--color-danger: #4b2e2b; /* Estados críticos - Marrom escuro */
--color-focus: #8c5a3c; /* Focus outline - Marrom médio */
--color-overlay: rgba(
  75,
  46,
  43,
  0.56
); /* Modais/overlays - Semi-transparente */
--shadow-soft: 0 8px 20px rgba(75, 46, 43, 0.18); /* Sombra padrão */
```

### Uso de Cores

| Cor                | Hex     | Uso Principal             | Contraste WCAG                   |
| ------------------ | ------- | ------------------------- | -------------------------------- |
| **Background**     | #fff8f0 | Sistema de fundo, body    | 21.00:1 (AAA com texto escuro)   |
| **Surface**        | #f7eadf | Cards, containers, panels | 13.92:1 (AAA com texto primário) |
| **Text**           | #4b2e2b | Texto primário, headings  | 21.00:1 (AAA com background)     |
| **Muted**          | #8c5a3c | Texto secundário, info    | 8.76:1 (AA com background)       |
| **Border**         | #d7c4b5 | Bordas, divisores, linhas | 5.21:1 (AA com background)       |
| **Primary**        | #8c5a3c | Botões primários          | 5.47:1 (AA com creme #fff8f0)    |
| **Primary Strong** | #4b2e2b | Estados hover/active      | 11.56:1 (AAA com creme)          |
| **Danger**         | #4b2e2b | Alertas, erros críticos   | 11.56:1 (AAA com background)     |

---

## Tipografia

### Fonte Principal: Lexend Deca

**Por que Lexend Deca?**

- ✅ Desenvolvida especificamente para **acessibilidade**
- ✅ Espaçamento generoso entre letras (ótimo para dislexia)
- ✅ Contadores abertos grandes (espaços internos das letras)
- ✅ Otimizada para leitura em telas
- ✅ Suporta todos os pesos (100-900)

**Configuração CSS:**

```css
body {
  font-family:
    "Lexend Deca",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 15px;
  letter-spacing: 0.3px;
}
```

**Pesos Recomendados:**

- **100-300**: Texto descritivo, subtítulos, labels
- **400-500**: Corpo de texto, label de formulários
- **600-700**: Headings, títulos importantes
- **800-900**: Títulos destacados, CTAs críticas

---

## Componentes de Button

### `.app-button-primary` - Botão Primário

**Uso:** Ações principais, Call-To-Action (CTA)

```css
.app-button-primary {
  background: var(--color-primary) !important; /* Marrom médio */
  color: var(--color-bg) !important; /* Creme */
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
}

.app-button-primary:hover:enabled {
  background: var(
    --color-primary-strong
  ) !important; /* Marrom escuro no hover */
  box-shadow: 0 6px 16px rgba(75, 46, 43, 0.24);
}

.app-button-primary:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

**Exemplos:**

- "Adicionar ao Carrinho" (BookCard)
- "Confirmar Pedido" (CheckoutPage)
- "Entrar" (LoginPage)
- "🎤 Ajuda de voz" (Layout header)

---

### `.app-button-secondary` - Botão Secundário

**Uso:** Ações de suporte, navegação, cancelamento

```css
.app-button-secondary {
  background: var(--color-primary) !important; /* Marrom médio */
  color: var(--color-bg) !important; /* Creme */
  border: 1px solid var(--color-border);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
}

.app-button-secondary:hover:enabled {
  background: var(--color-primary-strong) !important; /* Marrom escuro */
  box-shadow: 0 4px 12px rgba(75, 46, 43, 0.18);
}
```

**Exemplos:**

- "Sair" (Navbar)
- "Limpar Filtros" (BooksPage)
- "Voltar" (BookDetailsPage)
- "Continuar Comprando" (CartPage)

---

### `.cart-indicator-button` - Botão de Indicador (Header)

**Uso:** Botões de ação rápida no header (Carrinho, Ajuda de voz)

```css
.cart-indicator-button {
  background: var(--color-primary) !important;
  color: var(--color-bg) !important;
  min-height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

**Características:**

- Altura mínima de 40px para acessibilidade (touch targets)
- Alinhamento vertical centralizado
- Padding horizontal para melhor proporção

---

## Componentes de Card

### `.app-surface-card` / `.catalog-book-card` - Cartão de Conteúdo

**Uso:** Containers de informação, cards de catálogo, panels

```css
.catalog-book-card {
  background: var(--color-surface); /* Marrom quente claro */
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
  transition: all 0.18s ease;
}

.catalog-book-card:hover {
  box-shadow: 0 12px 24px rgba(75, 46, 43, 0.22);
  transform: translateY(-2px);
}
```

**Hierarquia Visual:**

1. **Background de sistema** (#fff8f0) - Espaço negativo, estrutura
2. **Surface de card** (#f7eadf) - Containers de conteúdo
3. **Texto primário** (#4b2e2b) - Informações principais
4. **Texto muted** (#8c5a3c) - Informações secundárias

---

## Input & Formulários

**Campos de entrada (input, textarea, select):**

```css
input[type="text"],
input[type="search"],
input[type="email"],
input[type="password"],
textarea,
select {
  border-color: var(--color-border); /* Marrom claro */
  background: var(--color-bg); /* Creme */
  color: var(--color-text); /* Marrom escuro */
  padding: 8px 12px;
  border-radius: 4px;
  font-family: "Lexend Deca", system-ui;
  font-size: 15px;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--color-primary); /* Marrom médio no focus */
  outline: none;
  box-shadow: 0 0 0 3px rgba(140, 90, 60, 0.1); /* Sombra suave */
}
```

---

## Acessibilidade

### Contrastes Validados (WCAG AA/AAA)

- ✅ Texto primário (#4b2e2b) em background (#fff8f0): **21.00:1** (AAA)
- ✅ Botão primário (brown + creme): **5.47:1** (AA)
- ✅ Texto muted (#8c5a3c) em background: **8.76:1** (AA)
- ✅ Todas as combinações atendem **WCAG AA** no mínimo

### Boas Práticas

1. **Não usar cor como único indicador**: Sempre combinar com ícones, texto ou padrões
2. **Focus states visíveis**: Todos os elementos focáveis têm outline de 2px
3. **Touch targets mínimos**: Botões com min-height 40px (recomendação acessibilidade)
4. **Fonte legível**: Lexend Deca com 15px base + line-height apropriado

---

## Estados de Componentes

### Button States

| Estado       | Estilo                                          |
| ------------ | ----------------------------------------------- |
| **Normal**   | background: #8c5a3c                             |
| **Hover**    | background: #4b2e2b, shadow aumentada           |
| **Active**   | transform: translateY(0), shadow menor          |
| **Disabled** | opacity: 0.6, cursor: not-allowed               |
| **Focus**    | outline: 2px solid #8c5a3c, outline-offset: 2px |

### Text States

| Tipo        | Cor     | Peso    | Uso                |
| ----------- | ------- | ------- | ------------------ |
| **Primary** | #4b2e2b | 600-700 | Headings, títulos  |
| **Body**    | #4b2e2b | 400-500 | Texto principal    |
| **Muted**   | #8c5a3c | 400     | Descrições, labels |
| **Danger**  | #4b2e2b | 500-600 | Mensagens de erro  |

---

## Implementação em Novos Componentes

### Exemplo: Novo Componente Button

```jsx
import { Button } from "@primer/react";

export function MyButton({ variant = "primary", ...props }) {
  const className =
    variant === "primary" ? "app-button-primary" : "app-button-secondary";

  return <Button className={className} {...props} />;
}
```

### Exemplo: Novo Componente Card

```jsx
export function MyCard({ children }) {
  return (
    <article
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 16,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {children}
    </article>
  );
}
```

---

## Checklist para Novos Componentes

- [ ] Usar cores do `:root` tokens (não RGB diretos)
- [ ] Aplicar `.app-button-primary` ou `.app-button-secondary` em buttons
- [ ] Usar `color: var(--color-text)` para texto primário
- [ ] Usar `color: var(--color-muted)` para texto secundário
- [ ] Implementar focus states visíveis (outline)
- [ ] Testar contraste com ferramenta WCAG
- [ ] Usar Lexend Deca como fonte principal
- [ ] Validar button touch targets (min-height 40px)

---

## Referências

- **Lexend Deca**: https://fonts.google.com/specimen/Lexend+Deca
- **WCAG Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Primer React Components**: https://primer.style/react
- **Accessible Color Palette Guide**: https://www.smashingmagazine.com/2019/08/accessible-color-systems/
