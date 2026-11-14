# Relato de Aprendizado — produtos-web

Nesta atividade implementei, com React e TypeScript, o exemplo “Thinking in React” da documentação oficial. O principal aprendizado foi perceber que criar uma interface em React não começa escrevendo código, mas entendendo como a tela pode ser dividida em componentes com responsabilidades menores.

A aplicação foi separada em cinco componentes principais. O `FilterableProductTable` representa a aplicação e concentra os estados. O `SearchBar` recebe a entrada do usuário. O `ProductTable` filtra e organiza os produtos. O `ProductCategoryRow` representa o título de cada categoria e o `ProductRow` representa cada produto individual. Essa divisão deixou claro como componentes podem ser combinados e reutilizados.

Outro ponto importante foi a diferença entre props e state. A lista original de produtos é recebida por props e não precisa ser armazenada novamente. Os únicos valores que realmente mudam pela interação do usuário são o texto da pesquisa e a opção de mostrar somente itens em estoque. Por isso usei apenas `filterText` e `inStockOnly` como estados. A lista filtrada é calculada durante a renderização, evitando guardar informação duplicada.

Também pratiquei o fluxo de dados unidirecional do React. Os estados ficam em `FilterableProductTable` e descem para os filhos por props. Para permitir que o `SearchBar` altere esses estados, o componente pai envia funções de atualização como callbacks. Assim, mesmo quando a interação acontece em um componente filho, a fonte da verdade continua no componente responsável pelo estado.

O uso de TypeScript ajudou a definir claramente o formato de um produto e as propriedades esperadas por cada componente. Isso tornou os contratos entre componentes mais explícitos e facilita encontrar erros durante o desenvolvimento. Para os estilos utilizei CSS Modules, evitando conflito entre nomes de classes e mantendo os estilos próximos dos componentes.

Por fim, o Vite simplificou a criação, execução e build do projeto. A atividade ajudou a compreender que “pensar em React” significa decompor a interface, identificar o menor estado necessário, escolher corretamente onde esse estado deve viver e manter o fluxo de dados previsível.
