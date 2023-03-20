# TypeScript, Node, Express - BackEnd API server
```
//dependências necessárias
npm install express body-parser cookie-parser compression cors mongoose lodash nodemon ts-node typescript
```
```
//dependências necessárias
npm i -d @types/express @types/body-parser @types/cookie-parser @types/compression @types/cors @types/mongoose @types/lodash
```
## src/index.ts

-   `express`: framework web para Node.js.
-   `http`: módulo Node.js para criar servidores HTTP.
-   `body-parser`: middleware Express para analisar o corpo da solicitação HTTP.
-   `cookie-parser`: middleware Express para analisar os cookies da solicitação HTTP.
-   `compression`: middleware Express para comprimir as respostas HTTP.
-   `cors`: middleware Express para lidar com CORS.
-   `router`: um módulo de roteamento personalizado para a sua aplicação.
-   `mongoose`: um pacote Node.js que fornece uma interface para trabalhar com bancos de dados MongoDB.

```typescript
const  app = express();
app.use(cors({
credentials:  true,
}))
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
const  server = http.createServer(app);
server.listen(8080, () => {
console.log("Servidor rodando em http://localhost:8080");
});
```
- O código cria uma instância do aplicativo Express e define suas configurações, incluindo o uso de `cors`, `compression`, `cookie-parser`, e `body-parser` como middlewares do Express.

- O código cria um servidor HTTP usando o `http.createServer()`, passando o aplicativo Express como argumento. Em seguida, o servidor é configurado para escutar a porta `8080`.

```typescript
const  MONGO_URL = '' //mongoDB URI 
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) =>{
console.log("MONGODB Connection error", error);
})
app.use('/', router());
```
### Conectando ao banco de dados:

-   O código define a URL do banco de dados MongoDB que será usada para se conectar ao banco de dados, usando o `mongoose.connect()`.

### Tratando erros de conexão:

-   O código configura o `mongoose` para lidar com erros de conexão ao banco de dados, emitindo uma mensagem de erro no console.

### Definindo rotas:

-   O código usa o `router()` para definir as rotas que serão usadas pelo aplicativo Express, que é importado do arquivo `./router`.

## src/db/users.ts
Esse arquivo `users.ts` é responsável por definir o modelo do schema de usuários do banco de dados, bem como as funções de CRUD (criar, ler, atualizar e excluir) relacionadas a este modelo.

O arquivo começa importando o pacote `mongoose`, que é uma biblioteca de modelagem de dados para MongoDB, e, em seguida, define um schema para o modelo de usuários. O schema tem três campos: `username`, `email` e `authentication`. O campo `username` e `email` são obrigatórios (`required: true`) e o campo `authentication` é um objeto com três subcampos: `password`, `salt` e `sessionToken`. O campo `password` é obrigatório e não será retornado em consultas (`select: false`), enquanto `salt` e `sessionToken` não são obrigatórios e também não serão retornados em consultas.
```typescript
import  mongoose  from  "mongoose";
const  UserSchema = new  mongoose.Schema({
username: {type:  String, required:  true},
email: {type:  String, required:  true},
authentication: {
password: {type:  String, required:  true, select:  false},
salt: {type:  String, select:  false},
sessionToken: {type:  String, select:  false},
},
});
```
Em seguida, o modelo de usuário é criado usando o schema e exportado como `UserModel`.

As funções de CRUD são exportadas do arquivo e operam sobre o modelo `UserModel`. As funções exportadas incluem `getUsers`, que retorna todos os usuários, `getUserByEmail`, que retorna um usuário com base no email, `getUserBySessionToken`, que retorna um usuário com base no token de sessão, `getUserById`, que retorna um usuário com base no id, `createUser`, que cria um novo usuário, `deleteUserById`, que exclui um usuário com base no id, e `updateUserById`, que atualiza um usuário com base no id e novos valores fornecidos.
```typescript
export  const  UserModel = mongoose.model('User', UserSchema);
export  const  getUsers = () =>  UserModel.find();
export  const  getUserByEmail = (email: string) =>  UserModel.findOne({ email });
export  const  getUserBySessionToken = (sessionToken: string) =>  UserModel.findOne({ 'authentication.sessionToken':  sessionToken });
export  const  getUserById = (id: string) =>  UserModel.findById(id);
export  const  createUser = (values: Record<string, any>) =>  new  UserModel(values).save().then((user) =>  user.toObject());
export  const  deleteUserById = (id: string) =>  UserModel.findOneAndDelete({ _id:  id });
export  const  updateUserById = (id: string, values: Record<string, any>) =>  UserModel.findByIdAndUpdate(id, values);
```
Todas as funções de CRUD são construídas usando o modelo `UserModel` e as funções fornecidas pelo pacote `mongoose`.

## src/controllers/users.ts

-   A primeira função, `getAllUsers`, é responsável por retornar todos os usuários cadastrados no banco de dados. Ela importa a função `getUsers` do arquivo `src/db/users.ts`, que é responsável por fazer a consulta ao banco de dados e retornar todos os usuários. Se a operação for bem sucedida, a função retorna uma resposta com status 200 e os usuários em formato JSON. Se ocorrer algum erro, a função retorna uma resposta com status 400.
```typescript
export const getAllUsers = async (req: express.Request, res: express.Response)
```    
-   A segunda função, `deleteUser`, é responsável por deletar um usuário específico do banco de dados. Ela importa a função `deleteUserById` do arquivo `src/db/users.ts`, que é responsável por fazer a remoção no banco de dados e retornar o usuário removido. Se a operação for bem sucedida, a função retorna uma resposta com o usuário removido em formato JSON. Se ocorrer algum erro, a função retorna uma resposta com status 400.
```typescript
export const deleteUser = async (req: express.Request, res: express.Response)
```
-   A terceira função, `updateUser`, é responsável por atualizar o nome de usuário de um usuário específico do banco de dados. Ela importa a função `getUserById` e utiliza a função `save` do objeto retornado para atualizar os dados do usuário. Se a operação for bem sucedida, a função retorna uma resposta com status 200 e o usuário atualizado em formato JSON. Se ocorrer algum erro, a função retorna uma resposta com status 400.
```typescript
export const updateUser = async (req: express.Request, res: express.Response)
```

## src/controllers/authentication.ts
O arquivo contém duas funções que lidam com a autenticação de usuários.

-   A primeira função, `login`, é responsável por autenticar um usuário no sistema. Ela importa a função `getUserByEmail` do arquivo `src/db/users.ts`, que é responsável por buscar o usuário pelo email no banco de dados. Se o usuário for encontrado, a função utiliza a função `authentication` do arquivo `src/helpers/index.ts` para gerar um hash a partir da senha digitada pelo usuário e a senha salva no banco de dados. Se as senhas não coincidirem, a função retorna uma resposta com status 403. Se as senhas coincidirem, a função gera um novo token de sessão para o usuário, salva no banco de dados e retorna uma resposta com status 200 contendo o usuário em formato JSON e um cookie com o token de sessão.
```typescript
export  const  login = async (req: express.Request, res: express.Response)
```
    
-   A segunda função, `register`, é responsável por registrar um novo usuário no sistema. Ela importa as funções `getUserByEmail` e `createUser` do arquivo `src/db/users.ts`. A função `getUserByEmail` é responsável por verificar se já existe um usuário com o mesmo email no banco de dados. Se existir, a função retorna uma resposta com status 400. Se não existir, a função utiliza a função `random` do arquivo `src/helpers/index.ts` para gerar um salt aleatório e a função `authentication` para gerar um hash a partir da senha digitada pelo usuário e o salt gerado. A função `createUser` é responsável por criar um novo usuário no banco de dados com os dados recebidos na requisição e retornar o usuário criado em formato JSON. Se ocorrer algum erro, a função retorna uma resposta com status 400.
```typescript
export  const  register = async (req: express.Request, res: express.Response)
```
## src/middlewares/index.ts
O arquivo contém código que define duas funções de middleware que são usadas pelo framework Express para processar as requisições e respostas HTTP. [O middleware é uma forma de adicionar funcionalidades extras ao seu servidor web, como autenticação, validação, logging, etc](http://expressjs.com/en/guide/using-middleware.html).

A primeira função de middleware se chama `isOwner` e recebe três parâmetros: `req`, `res` e `next`. Essa função verifica se o usuário que fez a requisição é o dono do recurso que ele está tentando acessar. Para isso, ela usa os seguintes passos:
```typescript
export  const  isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
try {
const { id } = req.params;
const  currentUserId = get(req, 'identity._id') as  string;
if (!currentUserId) {
return  res.sendStatus(400);
}
if (currentUserId.toString() !== id) {
return  res.sendStatus(403);
}
next();
} catch (error) {
console.log(error);
return  res.sendStatus(400);
}
}
```
-   Ela extrai o parâmetro  `id`  da URL da requisição e o armazena na variável  `id`.
-   Ela usa a função  `get`  do pacote  `lodash`  para obter o valor da propriedade  `_id`  do objeto  `identity`  que está dentro do objeto  `req`. Esse valor representa o identificador do usuário atual e é armazenado na variável  `currentUserId`.
-   Ela verifica se o valor de  `currentUserId`  existe. Se não existir, ela retorna um status 400 (Bad Request) para a resposta e encerra a função.
-   Ela compara o valor de  `currentUserId`  com o valor de  `id`, convertendo ambos para strings. Se eles forem diferentes, ela retorna um status 403 (Forbidden) para a resposta e encerra a função.
-   Se eles forem iguais, ela chama a função  `next`, que passa o controle para a próxima função de middleware na cadeia.

A segunda função de middleware se chama  `isAuthenticated`  e recebe os mesmos três parâmetros que a primeira. Essa função verifica se o usuário que fez a requisição está autenticado no sistema. Para isso, ela usa os seguintes passos:
```typescript
export  const  isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
try {
const  sessionToken = req.cookies['FATZIN-AUTH'];
if (!sessionToken) {
return  res.sendStatus(403);
}
const  existingUser = await  getUserBySessionToken(sessionToken);
if (!existingUser) {
return  res.sendStatus(403);
}
merge(req, { identity:  existingUser });
return  next();
} catch (error) {
console.log("isAuthenticated Middleware error: ", error);
return  res.sendStatus(400);
}
}
```
-   Ela usa a propriedade  `cookies`  do objeto  `req`  para obter o valor do cookie chamado ‘FATZIN-AUTH’ e armazena esse valor na variável  `sessionToken`.
-   Ela verifica se o valor de  `sessionToken`  existe. Se não existir, ela retorna um status 403 (Forbidden) para a resposta e encerra a função.
-   Ela usa a função  `getUserBySessionToken`, definida em outro arquivo, para buscar no banco de dados um usuário que tenha esse token de sessão. Ela armazena esse usuário na variável  `existingUser`.
-   Ela verifica se o valor de  `existingUser`  existe. Se não existir, ela retorna um status 403 (Forbidden) para a resposta e encerra a função.
-   Se existir, ela usa a função  `merge`  do pacote lodash para adicionar ao objeto req uma propriedade chamada identity com o valor de existingUser.
-   Em seguida, ela chama a função next , que passa o controle para a próxima função de middleware na cadeia.


## src/router
Os arquivos definem rotas para o seu servidor web usando o framework Express. [As rotas são uma forma de definir como o servidor responde a diferentes requisições HTTP que chegam em diferentes URLs](https://expressjs.com/en/guide/routing.html).

## src/router/index.ts
```typescript
export  default (router: express.Router) => {
router.post('/auth/register', register);
router.post('/auth/login', login);
};
```
O primeiro arquivo exporta uma função que recebe um objeto do tipo `express.Router` como parâmetro. [Esse objeto é usado para criar rotas específicas para a autenticação dos usuários](https://expressjs.com/en/guide/routing.html). A função usa os métodos `post` do objeto `router` para definir duas rotas: `/auth/register` e `/auth/login`. Essas rotas recebem requisições do tipo POST e chamam as funções `register` e `login`, respectivamente definidas previamente.

## src/router/authentication.ts
```typescript
const  router = express.Router();
export  default (): express.Router  => {
authentication(router);
users(router);
return  router;
}
```
O segundo arquivo exporta uma função que retorna um objeto do tipo `express.Router`. Essa função importa as funções dos arquivos `authentication.ts` e `users.ts`, e as usa para adicionar rotas ao objeto `router`. A função chama as funções importadas passando o objeto `router` como parâmetro. Assim, ela cria um conjunto de rotas para o servidor.

## src/router/users.ts
```typescript
export  default (router: express.Router) =>{
router.get('/users', isAuthenticated, getAllUsers);
router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
router.patch('/users/:id', isAuthenticated, isOwner, updateUser);
};
```
O terceiro arquivo exporta uma função que recebe um objeto do tipo `express.Router` como parâmetro. Essa função usa os métodos `get`, `delete` e `patch` do objeto router para definir três rotas: `/users`, `/users/:id`, `/users/:id`. Essas rotas recebem requisições dos tipos GET, DELETE e PATCH, respectivamente, e chamam as funções `getAllUsers`, deleteUser`, updateUser`.  Além disso, essas rotas usam as funções de middleware `isAuthenticated` e `isOwner` para verificar se o usuário está autenticado e é o dono do recurso que ele está tentando acessar.
