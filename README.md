# API de Instituição Financeira (API-IF)

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=for-the-badge&logo=mongodb)

API RESTful desenvolvida em Node.js, Express e Mongoose para simular os serviços financeiros básicos de uma Instituição Financeira (IF), como parte de um exercício de simulação de Open Finance.

Este projeto inclui gerenciamento de clientes, contas (corrente/poupança) e transações (crédito/débito), com um sistema de IDs personalizados (ex: `cus_001`, `acc_001`) e validação robusta de dados.

## Tabela de Conteúdos

- [API de Instituição Financeira (API-IF)](#api-de-instituição-financeira-api-if)
  - [Tabela de Conteúdos](#tabela-de-conteúdos)
  - [Sobre o Projeto](#sobre-o-projeto)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Começando](#começando)
    - [Pré-requisitos](#pré-requisitos)
    - [Instalação](#instalação)
    - [Configuração do Ambiente](#configuração-do-ambiente)
  - [Scripts Disponíveis](#scripts-disponíveis)
  - [Testes](#testes)
  - [Documentação da API (Endpoints)](#documentação-da-api-endpoints)
    - [Status](#status)
      - [`GET /`](#get-)
      - [`PATCH /customers/:customerId/consent`](#patch-customerscustomeridconsent)
    - [Contas (Accounts)](#contas-accounts)
      - [`POST /accounts`](#post-accounts)
      - [`GET /accounts/:accountId/balance`](#get-accountsaccountidbalance)
    - [Transações (Transactions)](#transações-transactions)
      - [`POST /transactions`](#post-transactions)
      - [`GET /transactions/:accountId`](#get-transactionsaccountid)
  - [Estrutura de Dados (Models)](#estrutura-de-dados-models)
  - [Features Principais](#features-principais)
  - [Autor](#autor)

## Sobre o Projeto

A proposta desta API é ser capaz de expor dados de clientes, contas e transações de maneira padronizada, permitindo a integração futura com outros sistemas em um ambiente simulado de Open Finance. Cada instância da API representa um banco independente.

## Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **Node.js**: Ambiente de execução JavaScript server-side.
- **Express.js**: Framework para construção da API RESTful.
- **Mongoose**: Biblioteca de modelagem de dados (ODM) para o MongoDB.
- **MongoDB Atlas**: Serviço de banco de dados NoSQL em nuvem.
- **Dotenv**: Para gerenciamento de variáveis de ambiente.
- **Nodemon**: Para "hot-reload" durante o desenvolvimento.

## Começando

Siga estas instruções para obter uma cópia funcional do projeto em sua máquina local.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [NPM](https://www.npmjs.com/) (geralmente instalado com o Node.js)
- Uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou um servidor MongoDB local.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
    ```
2.  Navegue até o diretório do projeto:
    ```bash
    cd SEU-REPOSITORIO
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```

### Configuração do Ambiente

1.  Crie um arquivo `.env` na raiz do projeto.
2.  Adicione as seguintes variáveis de ambiente, substituindo pelos seus valores:

    ```env
    # Conexão com o MongoDB (substitua pela sua string)
    MONGO_URI=mongodb+srv://<usuario>:<senha>@seucluster.mongodb.net/seuDatabase?retryWrites=true&w=majority

    # Porta do servidor (o padrão dos testes é 3000)
    PORT=3000
    ```

## Scripts Disponíveis

Você pode executar os seguintes scripts a partir do terminal (definidos no `package.json`):

- **`npm run dev`**: Inicia o servidor em modo de desenvolvimento com `nodemon`.
- **`npm start`**: Inicia o servidor em modo de produção.
- **`npm run cleanDB`**: Executa um script para limpar todas as coleções (`customers`, `accounts`, `transactions`, `counters`) do banco de dados, útil para testes.

## Testes 

A robustez, segurança e conformidade da API são validadas através de duas suítes de teste complementares, que cobrem a lógica de unidade e o fluxo de integração de ponta-a-ponta (E2E).

1. Testes de Unidade (Jest)
Os testes de unidade focam na peça mais crítica da arquitetura de segurança: o middleware de consentimento. A suíte de testes valida a "fábrica" de middleware validateConsent(permission).

- Lógica de Permissão: Simula ("mocka") as respostas dos Models Account e Consent para garantir que a lógica de permissão granular (ex: BALANCES_READ, CUSTOMER_DATA_READ) é aplicada corretamente.

- Contexto de Rota: Valida os dois cenários de busca de customerId:

  1. Rotas de conta (ex: /accounts/:accountId), onde o customerId é derivado da conta.

  2. Rotas de cliente (ex: /customers/:customerId), onde o customerId é direto.

- Caminhos de Falha: Confirma que todos os cenários de negação de acesso retornam a resposta de erro apropriada, incluindo:

  - 404 - Conta não encontrada.

  - 403 - Sem consentimento ativo (Status REVOKED ou data expirada).

  - 403 - Permissão insuficiente (Ex: Tentar acessar BALANCES_READ possuindo apenas ACCOUNTS_READ).

2. Testes End-to-End (Postman)
Uma coleção automatizada de 19 testes E2E valida o fluxo completo da API, simulando um caso de uso real do padrão Open Finance do início ao fim.

A coleção valida sequencialmente:

   1. Padronização: Confirma que todas as rotas respondem corretamente sob o prefixo global /openfinance.
   
   2. Criação de Entidades: Valida a criação bem-sucedida de POST /customers e POST /accounts.
   
   3. Segurança (Default-Deny):
      - Executa tentativas de acesso a todas as 4 rotas de dados protegidas (/balance, /accounts, /transactions, /customers/:id) antes da criação de um consentimento.
      - Confirma que a API retorna o erro 403 Forbidden em todos os casos.
  
   4. Fluxo de Consentimento (Criação e Consulta):

      - Valida a criação de um novo registro de consentimento (POST /consents), enviando um customerId e uma lista de permissões (ex: ['BALANCES_READ', 'ACCOUNTS_READ']).
      - Confirma que o registro é salvo com status: 'AUTHORIZED' e a data de expiração correta (lógica do Model).
      - Valida a consulta do consentimento (GET /consents/:id).

   5. Verificação de Acesso (Sucesso):

      - Após o consentimento ser validado, o teste acessa todas as 4 rotas protegidas novamente e confirma que a API agora retorna 200 OK.

   6. Lógica de Negócio (Transações e Saldo):

      - Cria uma transação de crédito (ex: +500) usando POST /transactions.
      - Consulta o extrato (GET /transactions/:id) para validar a criação da transação.
      - Consulta o saldo (GET /accounts/:id/balance) novamente para validar se a lógica de negócio foi executada e o saldo foi atualizado (ex: Saldo de 1000 + 500 = 1500).

   7. Fluxo de Revogação (Segurança):

      - Revoga o consentimento (DELETE /consents/:id).
      - Confirma que o status do consentimento foi atualizado para REVOKED.
      - Tenta acessar as rotas protegidas uma última vez e confirma que elas voltaram a retornar 403 Forbidden, validando o ciclo de vida completo do consentimento.

Para executar os testes, importe a coleção (o arquivo `.json` localizado na pasta `/postman` deste repositório) no Postman e execute as requisições. O script `npm run cleanDB` é recomendado para limpar o banco de dados entre as execuções completas dos testes.

## Documentação da API (Endpoints)

A URL base para todos os endpoints é `http://localhost:3000` (ou a porta definida no seu `.env`).

---

### Status

#### `GET /`

Verifica o status da API.

- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "status": "API is running"
  }

---

### Clientes (Customers)

#### `POST /customers`

Cria um novo cliente.

- **Corpo da Requisição (Body):**
```json
  {
    "name": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria.silva@email.com"
  }
  ```

- **Resposta de Sucesso (201 Created):**
```json
  {
    "_id": "cus_001",
    "name": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria.silva@email.com",
    "accounts": [],
    "consentData": false
  }
  ```

- **Respostas de Erro (400 Bad Request):**
  - CPF duplicado, CPF com formato inválido (`"message": "O CPF deve conter exatamente 11 dígitos numéricos..."`).
  - E-mail inválido, campos obrigatórios faltando.

#### `PATCH /customers/:customerId/consent`

Atualiza o consentimento de compartilhamento de dados de um cliente.

- **Parâmetros da URL:**
  - `customerId` (string): O ID do cliente a ser atualizado (ex: `cus_001`).
- **Corpo da Requisição (Body):**
  Espera um objeto JSON com a chave `consent`.
```json
  {
    "consent": true
  }
  ```

- **Resposta de Sucesso (200 OK):**
  Retorna o documento completo do cliente com o campo `consentData` atualizado.
```json
  {
    "_id": "cus_001",
    "name": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria.silva@email.com",
    "accounts": ["acc_001"],
    "consentData": true
  }
  ```

- **Respostas de Erro:**
  - **404 Not Found:** Se o `customerId` enviado na URL não for encontrado no banco (`"message": "Usuário não encontrado!"`).
  - **400 Bad Request:** Se o valor de `consent` não for um booleano (`true` ou `false`).

---

### Contas (Accounts)

#### `POST /accounts`

Cria uma nova conta (corrente ou poupança) e a associa a um cliente existente.

- **Corpo da Requisição (Body):**
```json
  {
    "customerId": "cus_001",
    "type": "checking",
    "branch": "0001",
    "number": "12345-6"
  }
  ```

- **Resposta de Sucesso (201 Created):**
```json
  {
    "_id": "acc_001",
    "type": "checking",
    "branch": "0001",
    "number": "12345-6",
    "balance": 0.00,
    "transactions": []
  }
  ```

- **Respostas de Erro (400/404):**
  - `customerId` não enviado ou cliente não encontrado (`"message": "Cliente não encontrado"`).
  - Número de conta duplicado (devido à regra `unique: true`).

#### `GET /accounts/:accountId/balance`

Consulta o saldo de uma conta específica.

- **Parâmetros da URL:**
  - `accountId` (string): O ID da conta (ex: `acc_001`).
- **Resposta de Sucesso (200 OK):**
```json
  {
    "balance": 1000.00
  }
  ```

- **Respostas de Erro (404 Not Found):**
  - Conta não encontrada (`"message": "Conta não encontrada"`).

---

### Transações (Transactions)

#### `POST /transactions`

Registra uma nova transação (crédito/débito) em uma conta. O saldo da conta é atualizado automaticamente.

- **Corpo da Requisição (Body):**
```json
  {
    "accountId": "acc_001",
    "description": "Depósito inicial",
    "amount": 1000.00,
    "type": "credit",
    "category": "Income"
  }
  ```

- **Resposta de Sucesso (201 Created):**
```json
  {
    "_id": "txn_001",
    "date": "2025-10-24",
    "description": "Depósito inicial",
    "amount": 1000.00,
    "type": "credit",
    "category": "Income"
  }
  ```

- **Respostas de Erro (400 Bad Request):**
  - Saldo insuficiente para transações de débito (`"message": "Saldo insuficiente"`).
  - Valor negativo ou zero (`"message": "...deve ser maior que R$ 0,00"`).
  - Valor com mais de 2 casas decimais (`"message": "...não é um valor monetário válido"`).
  - Tipo de transação inválido (ex: "transfer").

#### `GET /transactions/:accountId`

Lista todas as transações (extrato) de uma conta específica.

- **Parâmetros da URL:**
  - `accountId` (string): O ID da conta (ex: `acc_001`).
- **Resposta de Sucesso (200 OK):**
```json
  [
    {
      "_id": "txn_001",
      "date": "2025-10-24",
      "description": "Depósito inicial",
      "amount": 1000.00,
      "type": "credit",
      "category": "Income"
    },
    {
      "_id": "txn_002",
      "date": "2025-10-24",
      "description": "Saque",
      "amount": 200.00,
      "type": "debit",
      "category": "Withdrawal"
    }
  ]
  ```

- **Respostas de Erro (404 Not Found):**
  - Conta não encontrada (`"message": "Conta não encontrada"`).

## Estrutura de Dados (Models)

As entidades principais seguem a estrutura definida nos requisitos:

**Cliente (Customer)**
```json
  {
    "_id": "cus_001",
    "name": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria.silva@email.com",
    "accounts": ["acc_001"],
    "consentData": false
  }
  ```

**Conta (Account)**
```json
  {
    "_id": "acc_001",
    "type": "checking",
    "branch": "0001",
    "number": "12345-6",
    "balance": 800.00,
    "transactions": ["txn_001", "txn_002"]
  }
  ```

**Transação (Transaction)**
```json
  {
    "_id": "txn_001",
    "date": "2025-10-24",
    "description": "Depósito inicial",
    "amount": 1000.00,
    "type": "credit",
    "category": "Income"
  }
  ```

## Features Principais

- **Geração de IDs Personalizados**: O sistema utiliza uma coleção `counters` no MongoDB para gerar IDs sequenciais e formatados (ex: `cus_001`, `acc_001`, `txn_001`) para cada nova entidade, garantindo conformidade com os requisitos.
- **Validação de Dados Robusta**: A API utiliza validadores do Mongoose para garantir a integridade dos dados, incluindo:
  - Formato de CPF (exatamente 11 dígitos).
  - Formato de E-mail.
  - Unicidade de CPF, E-mail e Número da Conta.
  - Formato monetário (mínimo 0.01 e máximo de 2 casas decimais).
- **Cálculo de Saldo Atômico**: A lógica de transação (débito/crédito) atualiza o saldo da conta principal na mesma operação, com arredondamento para 2 casas decimais.

## Autor

Desenvolvido por **Mauro Artur Gomes de Oliveira**.