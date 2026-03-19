# Comandos de Voz por Pagina

Este documento centraliza os comandos de voz disponiveis no projeto.

## Como acionar

| Acao                               | Comportamento                            |
| ---------------------------------- | ---------------------------------------- |
| Tecla Space (primeiro acionamento) | Inicia a escuta de voz                   |
| Tecla Space (segundo acionamento)  | Cancela a escuta atual e informa por voz |
| Tecla ?                            | Abre o painel de ajuda de voz            |
| Tecla Esc                          | Fecha a modal aberta                     |
| Botao do assistente global         | Alterna entre iniciar e cancelar         |

## Comandos por rota

### Todas as rotas

| Intencao                 | Exemplos de frase                                             |
| ------------------------ | ------------------------------------------------------------- |
| Abrir catalogo de livros | "abrir livros", "mostrar catalogo", "listar livros"           |
| Abrir ajuda de voz       | "me ajude", "help", "preciso de ajuda", "comandos de voz"     |
| Fechar modal aberta      | "fechar", "fechar modal", "fechar ajuda", "fechar pedido"     |
| Logout                   | "deslogar", "faca logout", "saia do sistema", "efetue logout" |
| Buscar livro             | "buscar livro clean code", "procurar livro javascript"        |
| Abrir detalhes por nome  | "abrir detalhes de clean code", "ver detalhes de clean code"  |
| Abrir carrinho           | "abrir carrinho", "ver carrinho", "mostrar carrinho"          |
| Ir para checkout         | "finalizar compra", "concluir pedido", "checkout"             |
| Voltar pagina            | "voltar", "pagina anterior", "retornar"                       |
| Ir para inicio           | "abrir inicio", "mostrar home"                                |

### Rota /books/:id (detalhes do livro)

| Intencao                          | Exemplos de frase                                             |
| --------------------------------- | ------------------------------------------------------------- |
| Adicionar livro atual ao carrinho | "adicionar ao carrinho", "quero comprar", "compre esse livro" |
| Ler descricao do livro atual      | "ler descricao", "ouvir sinopse"                              |

### Rota /checkout

| Intencao                     | Exemplos de frase                                                  |
| ---------------------------- | ------------------------------------------------------------------ |
| Abrir pedido por numero      | "abrir pedido 1", "mostrar pedido numero 2", "ver pedido #3"       |
| Ler dados de pedido          | "ler dados do pedido", "ouvir detalhes do pedido", "ler pedido 3"  |
| Navegar para proximo pedido  | "proximo pedido", "pedido seguinte", "ir para o proximo pedido"    |
| Navegar para pedido anterior | "pedido anterior", "pedido passado", "voltar para pedido anterior" |

## Comandos recomendados para UI

Use esta secao para tooltip, modal de ajuda ou onboarding rapido. Sao frases curtas e de alta taxa de acerto.

| Contexto                   | Frases recomendadas                                                          |
| -------------------------- | ---------------------------------------------------------------------------- |
| Navegacao global           | "abrir livros", "abrir carrinho", "finalizar compra", "voltar"               |
| Ajuda e controle de modal  | "me ajude", "fechar modal", "fechar ajuda"                                   |
| Sessao do usuario          | "deslogar", "saia do sistema"                                                |
| Busca e detalhes de livros | "buscar livro clean code", "abrir detalhes de clean code"                    |
| Detalhes do livro          | "adicionar ao carrinho", "ler descricao"                                     |
| Checkout e pedidos         | "abrir pedido 3", "ler dados do pedido", "proximo pedido", "pedido anterior" |

Sugestao de uso na interface: mostrar de 3 a 5 frases por tela, evitando listar todos os aliases para nao poluir a experiencia.

## Aliases e comandos legados

Comandos abaixo sao aceitos para aumentar tolerancia de reconhecimento, mas nao precisam ser exibidos para o usuario final:

| Tipo                     | Variacoes aceitas                                            |
| ------------------------ | ------------------------------------------------------------ |
| Alias de proximo pedido  | "pedido prossimo", "pedido proxmo", "mostrar proxima compra" |
| Alias de pedido anterior | "retornar pedido atras", "pedido de antes"                   |
| Alias de ajuda           | "me ajuda", "pode me ajudar", "quero ajuda", "socorro"       |
| Alias de logout          | "deslogue", "logout"                                         |

Sugestao para UX: priorizar os exemplos da tabela principal na interface e manter os aliases apenas nesta documentacao tecnica.

## Observacoes de contexto

- Comandos de leitura de pedido funcionam no checkout; fora dele o assistente orienta o usuario a abrir essa tela.
- Navegacao entre pedidos depende de historico salvo no navegador (`orderHistory` em localStorage).
- Se um pedido nao for encontrado, o assistente informa por voz e exibe feedback visual na tela de checkout.
- O comando de fechar modal fecha a ajuda, a confirmacao de checkout e a modal de pedido quando alguma delas estiver aberta.
- O comando de logout encerra a sessao atual e redireciona para a tela de login.

## Dicas de teste

- Fale frases curtas, com pausa natural.
- Em comando com numero de pedido, prefira falar o numero de forma clara, por exemplo: "abrir pedido 12".
- Se o reconhecimento estiver ruidoso, cancele com Space e tente novamente.
