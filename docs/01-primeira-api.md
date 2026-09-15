# Aula 1 — A primeira resposta da FinTrack

## O que estamos preparando

O FinTrack será uma API para organizar contas, categorias e movimentações
financeiras de organizações diferentes. API é uma forma de um programa fazer
pedidos a outro programa e receber respostas.

Pense em um restaurante: o cliente faz um pedido e a cozinha prepara uma resposta.
Hoje vamos estabelecer essa comunicação. A primeira resposta apenas confirma
que a FinTrack está atendendo.

Meta desta aula: abrir `/health` no navegador e entender de onde vem a resposta.

## Os ingredientes

| Ingrediente | Função nesta receita |
| --- | --- |
| JavaScript | Linguagem que será executada. |
| TypeScript | Acrescenta verificações de tipos ao JavaScript durante o desenvolvimento. |
| Node.js | Executa nosso JavaScript fora do navegador. |
| npm | Instala as bibliotecas e executa os comandos definidos no projeto. |
| NestJS | Ajuda a organizar a aplicação e encaminhar pedidos para o código certo. |

Não é necessário dominar todos esses ingredientes hoje. Vamos aprendê-los em uso.

## 1. Ligar a API

Abra a pasta `fintrack` no seu editor e abra um terminal nessa pasta.
Se as dependências ainda não estiverem instaladas, execute `npm.cmd ci`.

No Windows/PowerShell, execute:

```powershell
npm.cmd run start:dev
```

`npm.cmd` é o npm do Windows. Usamos essa forma para evitar problemas com a
política de execução de scripts do PowerShell. Em outros sistemas, use `npm`.

O comando compila o TypeScript, liga o servidor e acompanha alterações no código.
Deixe o terminal aberto. Para desligar, pressione **Ctrl+C**.

## 2. Fazer o primeiro pedido

Abra <http://127.0.0.1:3000/health> no navegador. A resposta esperada é:

```json
{
  "status": "ok",
  "service": "fintrack-api"
}
```

- `127.0.0.1` significa este computador.
- `3000` é a porta em que a API recebe os pedidos.
- `/health` é o caminho da funcionalidade que estamos pedindo.
- Ao abrir esse endereço, o navegador envia uma requisição HTTP do tipo **GET**.
- A API responde com **200**, código HTTP de sucesso, e um objeto em **JSON**.

JSON é um formato de dados com pares de nome e valor. Aqui, `status` é um nome
e `ok` é seu valor. O Nest transforma o objeto retornado pelo código em JSON.

Este endpoint confirma apenas que o servidor responde. Ainda não há banco de
dados ou operações financeiras para verificar.

## 3. Conhecer os quatro arquivos principais

### `src/main.ts` — abrir o restaurante

É o ponto de entrada. `NestFactory.create(AppModule)` cria a aplicação usando
seu módulo principal. `app.listen(3000, '127.0.0.1')` começa a receber pedidos
na porta 3000 deste computador. `await` espera uma operação terminar antes de
continuar. Voltaremos a esse conceito com exemplos de JavaScript.

### `src/app.module.ts` — reunir a equipe

O módulo informa ao Nest quais peças fazem parte da aplicação. `controllers`
registra quem recebe os pedidos HTTP; `providers` registra serviços que o Nest
pode criar e fornecer a outras peças.

### `src/app.controller.ts` — receber o pedido

`@Controller()` identifica uma classe que atende requisições.
`@Get('health')` associa o pedido `GET /health` ao método `getHealth()`.
Essas anotações com `@` se chamam **decorators**: elas acrescentam informações
que o framework usa para organizar o funcionamento da aplicação.

O controller pede o resultado ao `AppService`. O Nest fornece esse serviço pelo
construtor; isso é **injeção de dependência**. Nesta aula, basta entender que o
controller recebe um colaborador pronto para usar.

### `src/app.service.ts` — preparar a resposta

O método `getHealth()` devolve o objeto com `status` e `service`.
`@Injectable()` marca o serviço para participar da injeção de dependência.
O Nest pode criá-lo e entregá-lo ao controller.

Esse serviço é pequeno de propósito. Quando surgirem funcionalidades de negócio,
vamos discutir onde colocar cada regra.

O caminho do pedido é:

```text
Navegador → GET /health → AppController → AppService → resposta JSON
```

Os arquivos são `.ts`, mas os imports locais terminam em `.js`: eles apontam
para os arquivos JavaScript que existirão depois da compilação.

## 4. Conferir a receita

Em outro terminal, dentro de `fintrack`:

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run lint
npm.cmd run build
```

- `test` verifica o retorno do controller com o serviço.
- `test:e2e` monta a aplicação e verifica a rota HTTP, o código 200 e o JSON.
- `lint` procura certos problemas no código.
- `build` transforma TypeScript em JavaScript na pasta `dist`.

Depois do build, `npm.cmd run start:prod` executa o JavaScript compilado. Pare
o servidor de desenvolvimento antes, pois os dois usariam a mesma porta.

Se aparecer `EADDRINUSE`, outro processo já está usando a porta 3000. Verifique
se você deixou uma cópia da API aberta em outro terminal e encerre-a com Ctrl+C.
Abrir `/` pode retornar 404: a rota que criamos é `/health`.

## 5. Um exercício pequeno

Com a API em desenvolvimento, altere o valor de `service` no `AppService` para
`minha-fintrack`. Salve e atualize o navegador. Depois restaure `fintrack-api`.

Observe: você mudou a resposta sem alterar o endereço. Se executar os testes
com o valor alterado, eles devem falhar, pois esperam o nome original.

Antes de avançar, tente explicar com suas palavras:

1. Quem recebe o pedido: controller ou service?
2. Em qual arquivo o servidor começa a funcionar?
3. Qual é a diferença entre o endereço `/health` e o conteúdo da resposta?

## Próxima aula

Definir `Organization` em linguagem simples e suas primeiras regras, para depois
construir o cadastro. Vamos acrescentar persistência e demais recursos em etapas.

Referência: [Primeiros passos — documentação oficial do NestJS](https://docs.nestjs.com/first-steps).
