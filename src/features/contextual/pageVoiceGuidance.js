const GLOBAL_UI_COMMANDS = [
  "abrir livros",
  "abrir carrinho",
  "abrir pedidos",
  "voltar para início",
  "me ajude",
  "voltar",
];

const SESSION_MODAL_COMMANDS = [
  "fechar modal",
  "fechar ajuda",
  "deslogar",
  "saia do sistema",
];

function buildSpeechText(title, commands, description) {
  return [
    description,
    `${title}: ${commands.join(", ")}.`,
    'Você pode dizer "repetir instruções" para ouvir este resumo novamente.',
  ].join(" ");
}

export function getPageVoiceGuidance(pathname) {
  if (/^\/books\/\d+$/.test(pathname)) {
    const commands = [
      "adicionar ao carrinho",
      "ler título",
      "ler detalhes",
      "ler descrição",
    ];
    return {
      title: "Dicas para detalhes do livro",
      description:
        "Você está na página de detalhes do livro. Aqui pode ouvir a descrição completa e adicionar o item ao carrinho.",
      commands,
      speechText: buildSpeechText(
        "Comandos da página de detalhes",
        commands,
        "Você está na página de detalhes do livro.",
      ),
    };
  }

  if (pathname === "/checkout") {
    const commands = [
      "continuar comprando",
      "voltar ao carrinho",
      "abrir pedido 3",
      "ler dados do pedido",
      "próximo pedido",
      "pedido anterior",
    ];
    return {
      title: "Dicas para pedidos",
      description:
        "Você está na área de pedidos. Aqui pode revisar pedidos recentes e navegar entre eles por voz.",
      commands,
      speechText: buildSpeechText(
        "Comandos da página de pedidos",
        commands,
        "Você está na área de pedidos.",
      ),
    };
  }

  if (pathname === "/books") {
    const commands = [
      '"buscar livro"',
      '"nome do livro"',
      "ler livros disponíveis",
      "ler resultados da busca",
      "ler próximos resultados",
      "ler resultados anteriores",
      "repetir resultados",
      'selecionar "nome do livro"',
      'abrir detalhes de "nome do livro"',
    ];
    return {
      title: "Dicas para catálogo",
      description:
        "Você está no catálogo de livros. Aqui pode buscar títulos, ouvir resultados e selecionar um livro para abrir os detalhes.",
      commands,
      speechText: buildSpeechText(
        "Comandos do catálogo",
        commands,
        "Você está no catálogo de livros.",
      ),
    };
  }

  if (pathname === "/cart") {
    const commands = [
      "ler itens",
      "ler itens do carrinho",
      "total do carrinho",
      "finalizar compra",
      "confirmar",
      "cancelar",
      "continuar comprando",
    ];
    return {
      title: "Dicas para carrinho",
      description:
        "Você está no carrinho. Aqui pode revisar itens, ouvir o total e concluir a compra com confirmação por voz.",
      commands,
      speechText: buildSpeechText(
        "Comandos do carrinho",
        commands,
        "Você está no carrinho.",
      ),
    };
  }

  const commands = [
    "abrir livros",
    "abrir carrinho",
    "abrir pedidos",
    "voltar para início",
  ];
  return {
    title: "Dicas gerais",
    description:
      "Você está na página inicial. A partir daqui pode navegar para livros, carrinho e pedidos usando voz ou teclado.",
    commands,
    speechText: buildSpeechText(
      "Comandos da página inicial",
      commands,
      "Você está na página inicial.",
    ),
  };
}

export function getGlobalVoiceCommands() {
  return GLOBAL_UI_COMMANDS;
}

export function getSessionModalCommands() {
  return SESSION_MODAL_COMMANDS;
}
