# Comandos de Voz por Página

Este documento centraliza os comandos de voz disponíveis no projeto.

## Como acionar

| Ação                               | Comportamento                            |
| ---------------------------------- | ---------------------------------------- |
| Tecla Space (primeiro acionamento) | Inicia a escuta de voz                   |
| Tecla Space (segundo acionamento)  | Cancela a escuta atual e informa por voz |
| Tecla ?                            | Abre o painel de ajuda de voz            |
| Tecla Esc                          | Fecha a modal aberta                     |
| Botão do assistente global         | Alterna entre iniciar e cancelar         |

## Comandos por rota

### Todas as rotas

| Intenção                    | Exemplos de frase                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Abrir catálogo de livros    | "abrir livros", "mostrar catálogo", "listar livros", "ir para livros"                 |
| Abrir ajuda de voz          | "me ajude", "preciso de ajuda", "comandos de voz", "abrir ajuda"                      |
| Fechar modal aberta         | "fechar", "fechar modal", "fechar ajuda", "fechar pedido"                             |
| Logout                      | "deslogar", "faça logout", "saia do sistema", "sair do sistema", "encerrar sessão"    |
| Buscar livro                | "buscar livro interfaces acessíveis", "procurar livro programação na web"             |
| Abrir detalhes por nome     | "abrir detalhes de interfaces acessíveis", "ver detalhes de programação na web"       |
| Abrir carrinho              | "abrir carrinho", "ver carrinho", "mostrar carrinho", "ir para carrinho"              |
| Ler itens no carrinho       | "ler itens do carrinho", "listar itens do carrinho", "quais livros estão no carrinho" |
| Ler total do carrinho       | "informe o total do carrinho", "total do carrinho", "qual o total"                    |
| Consultar itens no carrinho | "quantos itens", "quantidade de itens", "total de itens"                              |
| Limpar carrinho             | "limpar carrinho", "esvaziar carrinho", "zerar carrinho"                              |
| Remover último item         | "remover", "tirar item do carrinho", "remover último item"                            |
| Remover livro do carrinho   | "remover livro interfaces acessíveis", "remover interfaces acessíveis do carrinho"    |
| Ir para checkout            | "finalizar compra", "concluir pedido", "checkout"                                     |
| Voltar página               | "voltar", "página anterior", "retornar"                                               |
| Ir para início              | "abrir início", "mostrar home", "voltar para início", "voltar para página inicial"    |

### Rota /home (Página de Início)

Nesta página, há suporte aprimorado para reconhecimento parcial:

| Intenção                  | Exemplos de frase                           |
| ------------------------- | ------------------------------------------- |
| Abrir catálogo de livros  | "abrir livros", "mostrar catálogo", "abrir" |
| (comando parcial na home) | "abra", "ver", "veja"                       |

**Nota de reconhecimento de voz**: Quando você fala "Abrir Livros" na página de Início, se apenas "Abrir" for reconhecido pelo navegador, o sistema agora interpretará como "Abrir Livros" de forma inteligente. Isso melhora a taxa de acerto em ambientes com áudio inconsistente.

### Rota /books/:id (detalhes do livro)

| Intenção                          | Exemplos de frase                                             |
| --------------------------------- | ------------------------------------------------------------- |
| Adicionar livro atual ao carrinho | "adicionar ao carrinho", "quero comprar", "compre esse livro" |
| Ler descrição do livro atual      | "ler descrição", "ouvir sinopse"                              |

### Rota /books

| Intenção                  | Exemplos de frase                                                         |
| ------------------------- | ------------------------------------------------------------------------- |
| Buscar livro              | "buscar livro interfaces acessíveis", "procurar livro programação na web" |
| Ouvir quantidade buscada  | retorno falado automático como "A busca retornou dois livros"             |
| Ler resultados da busca   | "ler resultados da busca", "ler títulos dos livros"                       |
| Ler próximos resultados   | "ler próximos resultados", "mais resultados"                              |
| Ler resultados anteriores | "ler resultados anteriores", "voltar resultados"                          |
| Repetir último bloco      | "repetir resultados", "ler novamente os resultados"                       |

Ao ler os resultados da busca, o assistente informa título, autor e preço de cada livro retornado.

Quando a busca tiver mais de 3 livros, o assistente lê somente um bloco de 3 por vez e orienta os comandos para continuar, voltar ou repetir.

### Rota /cart (Carrinho)

| Intenção                     | Exemplos de frase                                                  |
| ---------------------------- | ------------------------------------------------------------------ |
| Ler itens no carrinho        | "ler itens do carrinho", "listar itens do carrinho"                |
| Ler total do carrinho        | "informe o total do carrinho", "total do carrinho", "qual o total" |
| Abrir diálogo de confirmação | "finalizar compra", "concluir pedido", "checkout"                  |
| Confirmar e criar pedido     | "confirmar", "ok", "sim", "prosseguir", "continuar", "aprovar"     |
| Cancelar e fechar diálogo    | "cancelar", "fechar", "voltar"                                     |
| Voltar para catálogo         | "continuar comprando"                                              |

### Rota /checkout

| Intenção                     | Exemplos de frase                                                  |
| ---------------------------- | ------------------------------------------------------------------ |
| Abrir pedido por número      | "abrir pedido 1", "mostrar pedido número 2", "ver pedido #3"       |
| Ler dados de pedido          | "ler dados do pedido", "ouvir detalhes do pedido", "ler pedido 3"  |
| Navegar para próximo pedido  | "próximo pedido", "pedido seguinte", "ir para o próximo pedido"    |
| Navegar para pedido anterior | "pedido anterior", "pedido passado", "voltar para pedido anterior" |
| Continuar comprando          | "continuar comprando", "vou continuar comprando"                   |
| Voltar ao carrinho           | "voltar ao carrinho", "retornar para o carrinho"                   |

## Comandos recomendados para UI

Use esta seção para tooltip, modal de ajuda ou onboarding rápido. São frases curtas e de alta taxa de acerto.

| Contexto                    | Frases recomendadas                                                          |
| --------------------------- | ---------------------------------------------------------------------------- |
| Navegação global            | "abrir livros", "ir para carrinho", "finalizar compra", "voltar"             |
| Voltar para início          | "abrir início", "voltar para início", "voltar para página inicial"           |
| Carrinho por voz            | "limpar carrinho", "remover", "remover livro interfaces acessíveis"          |
| Leitura do carrinho         | "ler itens do carrinho", "listar itens do carrinho"                          |
| Total do carrinho           | "informe o total do carrinho", "total do carrinho", "qual o total"           |
| Finalizar compra (carrinho) | "finalizar compra", "confirmar"                                              |
| Consulta do carrinho        | "quantos itens", "quantidade de itens", "total de itens"                     |
| Ajuda e controle de modal   | "me ajude", "fechar modal", "fechar ajuda"                                   |
| Sessão do usuário           | "deslogar", "sair do sistema", "encerrar sessão"                             |
| Busca e detalhes de livros  | "buscar livro interfaces acessíveis", "abrir detalhes de programação na web" |
| Detalhes do livro           | "adicionar ao carrinho", "ler descrição"                                     |
| Checkout e pedidos          | "abrir pedido 3", "ler dados do pedido", "próximo pedido", "pedido anterior" |

Na tela de checkout, prefira usar as frases que acompanham os botões visíveis na interface, como "continuar comprando" e "voltar ao carrinho".

Sugestão de uso na interface: mostrar de 3 a 5 frases por tela, evitando listar todos os aliases para não poluir a experiência.

## Aliases e comandos legados

Comandos abaixo são aceitos para aumentar tolerância de reconhecimento, mas não precisam ser exibidos para o usuário final:

| Tipo                       | Variações aceitas                                                                 |
| -------------------------- | --------------------------------------------------------------------------------- |
| Alias de abrir livros      | "quero ir para livros", "acessar o catálogo de livros", "me leve para os livros"  |
| Alias de abrir carrinho    | "quero ir para o carrinho", "acessar o carrinho", "me leve para o carrinho"       |
| Alias de consulta carrinho | "quantidade de itens no carrinho", "total de itens do carrinho", "quantos itens"  |
| Alias de limpar carrinho   | "esvaziar carrinho", "zerar carrinho"                                             |
| Alias de remover item      | "tirar item do carrinho", "remover último item"                                   |
| Alias de remover livro     | "remover livro <nome>", "remover <nome> do carrinho", "remover <nome>"            |
| Alias de próximo pedido    | "pedido prossimo", "pedido proxmo", "mostrar próxima compra"                      |
| Alias de pedido anterior   | "retornar pedido atrás", "pedido de antes"                                        |
| Alias de ajuda             | "me ajuda", "pode me ajudar", "quero ajuda", "socorro"                            |
| Alias de logout            | "deslogue", "logout", "logoff", "sair da conta", "termine a sessão atual", "help" |

Sugestão para UX: priorizar os exemplos da tabela principal na interface e manter os aliases apenas nesta documentação técnica.

## Observações de contexto

- Comandos de leitura de pedido funcionam no checkout; fora dele o assistente orienta o usuário a abrir essa tela.
- Ao navegar com "próximo pedido" ou "pedido anterior", o assistente abre o pedido e também faz a leitura dos dados.
- Navegação entre pedidos depende de histórico salvo no navegador (`orderHistory` em localStorage).
- Se um pedido não for encontrado, o assistente informa por voz e exibe feedback visual na tela de checkout.
- O comando de fechar modal fecha a ajuda, a confirmação de checkout e a modal de pedido quando alguma delas estiver aberta.
- O comando de logout encerra a sessão atual e redireciona para a tela de login.

## Dicas de teste

- Fale frases curtas, com pausa natural.
- Em comando com número de pedido, prefira falar o número de forma clara, por exemplo: "abrir pedido 12".
- Se o reconhecimento estiver ruidoso, cancele com Space e tente novamente.
