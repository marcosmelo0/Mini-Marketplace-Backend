# 🏪 Mini Marketplace de Serviços

> Uma plataforma completa para conectar prestadores de serviços e clientes, com agendamento inteligente, busca avançada, avaliações e notificações por email.

--- 

Vídeo DEMO: https://youtu.be/HW6Kce8lf9g

---

![NodeJS](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)
![Redis](https://img.shields.io/badge/Redis-Cache-red.svg)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-Search-yellow.svg)

## ✨ Funcionalidades

- **👥 Perfis de Usuário**:
  - **Prestadores**: Cadastram serviços, gerenciam disponibilidade e visualizam agendamentos.
  - **Clientes**: Buscam serviços, realizam agendamentos e avaliam atendimentos.
- **📅 Agendamento Inteligente**: Sistema que valida conflitos de horário e disponibilidade do prestador com cache em Redis.
- **🔍 Busca Avançada**: Pesquisa de serviços por nome, categoria ou descrição usando **Elasticsearch**.
- **⭐ Avaliações**: Sistema de rating e comentários para serviços realizados.
- **🔔 Notificações**: 
  - Alertas in-app sobre novos agendamentos e atualizações de status.
  - Emails automáticos via **Nodemailer** (boas-vindas, confirmações, cancelamentos).
- **💰 Descontos Dinâmicos**: Sistema de descontos por dia da semana aplicados automaticamente.
- **📸 Upload de Fotos**: Suporte para múltiplas fotos de serviços.
- **🕐 Timezone**: Tratamento correto de fusos horários (America/Sao_Paulo).

---

## 🚀 Quick Start (Início Rápido)

Se você já tem **Docker** e **Node.js** instalados, rode estes comandos para ver a mágica acontecer:

```bash
# 1. Clone o projeto
git clone https://github.com/marcosmelo0/Mini-Marketplace-Backend.git
cd mini-marketplace

# 2. Instale dependências
npm install

# 3. Configure o arquivo .env (veja seção abaixo)
cp .env.example .env
# Edite o .env com suas configurações

# 4. Suba os serviços (Banco, Redis, Elasticsearch)
docker-compose up -d

# 5. Configure o banco e popule com dados de teste
npx prisma generate
npx prisma migrate dev
npm run seed

# 6. Inicie o servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3000` 🚀

---

## 🛠️ Instalação Detalhada

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) & Docker Compose
- [Insomnia](https://insomnia.rest/) ou [Postman](https://www.postman.com/) (Opcional, para testar a API)

### Passo a Passo

1. **Configuração de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto. Você pode usar o exemplo abaixo:

   ```env
   # Banco de Dados (PostgreSQL)
   DATABASE_URL="postgresql://postgres:password@localhost:5432/marketplace?schema=public"

   # Autenticação (JWT)
   JWT_SECRET="supersecretkey"

   # Busca (Elasticsearch)
   ELASTICSEARCH_NODE="http://localhost:9200"

   # Cache (Redis)
   REDIS_URL="redis://localhost:6379"

2. **Infraestrutura**:
   Inicie os containers do Docker. Isso vai configurar o PostgreSQL, Redis e Elasticsearch para você.
   ```bash
   docker-compose up -d
   ```

3. **Banco de Dados**:
   Aplique as migrações para criar as tabelas e gere o cliente do Prisma.
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Dados Iniciais (Seed)**:
   Para não começar com o banco vazio, rode o seed para criar usuários e serviços de exemplo.
   ```bash
   npm run seed
   ```
   
   > **Nota**: O seed cria automaticamente:
   > - 10 prestadores (um para cada nicho: Barbeiro, Manicure, Personal Trainer, etc.)
   > - 5 clientes
   > - Serviços com variações e fotos
   > - Disponibilidades para cada prestador
   > - Histórico de agendamentos e avaliações
   > - Dados de visualizações no Redis

5. **Iniciar o Servidor**:
   ```bash
   npm run dev
   ```

---

## 🔌 Documentação da API

A API é RESTful e retorna dados em JSON. Abaixo estão as principais rotas.

> **Dica**: Importe o arquivo `insomnia-collection.json` (na raiz do projeto) no **Insomnia** para testar todas as rotas prontamente.


### 🔐 Autenticação

> **Importante**: A API utiliza **HTTP-only cookies** para armazenar tokens JWT, aumentando a segurança contra ataques XSS.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cria uma nova conta (Cliente ou Provedor) |
| `POST` | `/auth/login` | Autentica e define cookies HTTP-only com tokens |
| `POST` | `/auth/refresh` | Renova o token de acesso (lê do cookie) |
| `POST` | `/auth/logout` | Realiza logout e limpa os cookies |

### 👤 Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users/profile` | Retorna dados do usuário logado |
| `PUT` | `/users/profile` | Atualiza dados do perfil |
| `GET` | `/users/providers` | Lista todos os prestadores cadastrados |

### 🛍️ Serviços
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/services` | Lista serviços (com filtros e ordenação) |
| `GET` | `/services/types` | Lista categorias disponíveis |
| `GET` | `/services/popular` | Serviços mais visualizados |
| `GET` | `/services/:id` | Detalhes de um serviço |
| `GET` | `/services/:id/photos/:index` | Retorna foto do serviço |
| `POST` | `/services` | Cria um novo serviço (Apenas Provedor) |
| `GET` | `/services/provider/my-services` | Lista serviços do provedor logado |
| `PUT` | `/services/:id` | Atualiza serviço (Apenas Provedor) |
| `DELETE` | `/services/:id` | Deleta serviço (Apenas Provedor) |

### 📅 Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/bookings` | Cria um novo agendamento |
| `GET` | `/bookings/client/my-bookings` | Lista agendamentos do cliente |
| `GET` | `/bookings/provider/my-bookings` | Lista agendamentos recebidos pelo provedor |
| `PATCH` | `/bookings/:id/cancel` | Cancela um agendamento |

### ⭐ Avaliações
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/reviews` | Cria avaliação para um serviço |
| `GET` | `/reviews/services/:serviceId` | Lista avaliações de um serviço |

### 📅 Disponibilidade
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/availabilities` | Define horário de trabalho (Provedor) |
| `GET` | `/availabilities/my-availabilities` | Vê horários configurados |
| `PUT` | `/availabilities/:id` | Atualiza disponibilidade |
| `DELETE` | `/availabilities/:id` | Remove disponibilidade |
| `GET` | `/availabilities/provider/:providerId/slots` | Obtém slots disponíveis (público) |

### 🔔 Notificações
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/notifications/my-notifications` | Lista notificações (Provedor) |
| `GET` | `/notifications/unread-count` | Conta notificações não lidas |
| `PATCH` | `/notifications/:id/read` | Marca notificação como lida |

### 🔍 Busca
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/search` | Busca serviços via Elasticsearch (`?q=termo`) |
| `GET` | `/search/recent` | Buscas recentes do usuário |

### ❤️ Health Check
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica status da API e dependências |

---

## 📂 Estrutura do Projeto

```
mini-marketplace/
├── 🐳 docker-compose.yml    # Serviços (DB, Redis, Elastic)
├── 📄 insomnia-collection.json # Coleção de testes
├── 📂 prisma/
│   ├── schema.prisma        # Modelagem do Banco
│   ├── migrations/          # Histórico de migrações
│   └── seed.ts              # Dados iniciais
├── 📂 src/
│   ├── 📂 config/           # Configurações (Redis, Elasticsearch, Email)
│   ├── 📂 controllers/      # Lógica de entrada/saída das rotas
│   ├── 📂 middlewares/      # Proteção de rotas e validações
│   ├── 📂 repositories/     # Acesso direto ao banco (Prisma)
│   ├── 📂 services/         # Regras de negócio
│   ├── 📂 routes/           # Definição dos endpoints
│   ├── 📂 scripts/          # Scripts utilitários (reindex)
│   ├── 📂 jobs/             # Jobs em background (cron)
│   ├── app.ts               # Setup do Express
│   └── server.ts            # Entry point
└── ...
```

---

## 🎯 Funcionalidades Técnicas

### 🔒 Segurança
- **HTTP-only Cookies** para armazenamento seguro de tokens JWT
- **JWT Authentication** com refresh tokens
- **CORS** configurado com suporte a credenciais
- **Helmet** para headers de segurança
- **Rate Limiting** para prevenir abuso
- **Bcrypt** para hash de senhas
- **SameSite** policy para proteção contra CSRF

### ⚡ Performance
- **Redis** para cache de slots disponíveis (5 min TTL)
- **Redis** para contador de serviços populares
- **Índices otimizados** no PostgreSQL
- **Cache-Control** para fotos de serviços (1 ano)

### 🔍 Busca
- **Elasticsearch** para busca full-text
- Busca por nome, descrição e categoria
- Histórico de buscas recentes por usuário (Redis)

### 📧 Notificações
- **Notificações in-app** para prestadores
- **Emails automáticos** via Nodemailer:
  - Boas-vindas ao registrar
  - Confirmação de agendamento
  - Notificação de cancelamento
- Templates HTML profissionais

### 🕐 Timezone
- Todas as datas tratadas em `America/Sao_Paulo` (UTC-3)
- Uso de `date-fns-tz` para conversões corretas

### 🤖 Jobs Automáticos
- **Conclusão de Agendamentos**: Executa a cada 5 minutos, marca agendamentos passados como `COMPLETED`

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento (watch mode)
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Popular banco com dados de teste
npm run seed

# Reindexar serviços no Elasticsearch
npm run reindex

# Gerar cliente Prisma
npx prisma generate

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Visualizar banco de dados
npx prisma studio
```

---

## 🐛 Troubleshooting

### Erro de conexão com Banco/Redis/Elasticsearch
- Verifique se os containers estão rodando: `docker-compose ps`
- Reinicie os containers: `docker-compose restart`
- Veja os logs: `docker-compose logs -f`

### Porta em uso
- Se a porta 3000 estiver ocupada, mude no arquivo `.env`
- Ou mate o processo: `npx kill-port 3000`

### Elasticsearch erro de memória
- O Elastic exige bastante RAM. Se cair, tente aumentar o limite no Docker
- No WSL (Windows), aumente a memória disponível no `.wslconfig`

### Emails não estão sendo enviados
- Verifique as credenciais SMTP no `.env`
- Para Gmail, certifique-se de usar uma "Senha de App", não sua senha normal
- Verifique se a autenticação de 2 fatores está ativada na conta Google
- Teste com outro provedor SMTP se necessário

### Prisma Client não encontrado
- Execute: `npx prisma generate`
- Certifique-se de que as migrações foram aplicadas: `npx prisma migrate dev`

---

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis de ambiente no seu servidor:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=seu-secret-super-seguro-aqui
ELASTICSEARCH_NODE=http://elasticsearch:9200
REDIS_URL=redis://redis:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=noreply@minimarketplace.com
FRONTEND_URL=https://seu-frontend.com
PORT=3000
NODE_ENV=production
```

### Passos para Deploy

1. Build da aplicação:
   ```bash
   npm run build
   ```

2. Aplicar migrações:
   ```bash
   npx prisma migrate deploy
   ```

3. Iniciar servidor:
   ```bash
   npm start
   ```

---

Feito com 💜 por [Marcos](https://github.com/marcosmelo0)
