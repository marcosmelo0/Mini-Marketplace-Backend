# 🏪 Mini Marketplace de Serviços

> Uma plataforma completa para conectar prestadores de serviços e clientes, com agendamento, busca avançada e avaliações.

![NodeJS](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-black.svg)

## ✨ Funcionalidades

- **👥 Perfis de Usuário**:
  - **Prestadores**: Cadastram serviços, gerenciam disponibilidade e visualizam agendamentos.
  - **Clientes**: Buscam serviços, realizam agendamentos e avaliam atendimentos.
- **📅 Agendamento Inteligente**: Sistema que valida conflitos de horário e disponibilidade do prestador.
- **🔍 Busca Avançada**: Pesquisa de serviços por nome, categoria ou descrição usando **Elasticsearch**.
- **⭐ Avaliações**: Sistema de rating e comentários para serviços realizados.
- **🔔 Notificações**: Alertas sobre novos agendamentos e atualizações de status.

---

## 🚀 Quick Start (Início Rápido)

Se você já tem **Docker** e **Node.js** instalados, rode estes comandos para ver a mágica acontecer:

```bash
# 1. Clone o projeto
git clone https://github.com/marcosmelo0/Mini-Marketplace-Backend.git
cd mini-marketplace

# 2. Instale dependências
npm install

# 3. Suba os serviços (Banco, Redis, Elastic)
docker-compose up -d

# 4. Configure o banco e popule com dados de teste
npx prisma migrate dev
npm run seed

# 5. Inicie o servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3000` 🚀

---

## 🛠️ Instalação Detalhada

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) & Docker Compose
- [Insomnia](https://insomnia.rest/) (Opcional, para testar a API)

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

   # Servidor
   PORT=3000
   ```

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

---

## 🔌 Documentação da API

A API é RESTful e retorna dados em JSON. Abaixo estão as principais rotas.

> **Dica**: Importe o arquivo `insomnia-collection.json` (na raiz do projeto) no **Insomnia** para testar todas as rotas prontamente.

### 🔐 Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cria uma nova conta (Cliente ou Provedor) |
| `POST` | `/auth/login` | Autentica e retorna Token JWT |
| `POST` | `/auth/refresh` | Renova o token de acesso |

### 👤 Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users/profile` | Retorna dados do usuário logado |
| `PUT` | `/users/profile` | Atualiza dados do perfil |
| `GET` | `/users/providers` | Lista todos os prestadores cadastrados |

### 🛍️ Serviços
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/services` | Lista serviços (com filtros) |
| `GET` | `/search` | Busca serviços via Elasticsearch (`?q=termo`) |
| `POST` | `/services` | Cria um novo serviço (Apenas Provedor) |
| `GET` | `/services/provider/my-services` | Lista serviços do provedor logado |

### 📅 Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/bookings` | Cria um novo agendamento |
| `GET` | `/bookings/client/my-bookings` | Lista agendamentos do cliente |
| `GET` | `/bookings/provider/my-bookings` | Lista agendamentos recebidos pelo provedor |
| `PATCH` | `/bookings/:id/cancel` | Cancela um agendamento |

### 📅 Disponibilidade
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/availabilities` | Define horário de trabalho (Provedor) |
| `GET` | `/availabilities/my-availabilities` | Vê horários configurados |

---

## 📂 Estrutura do Projeto

```
mini-marketplace/
├── 🐳 docker-compose.yml    # Serviços (DB, Redis, Elastic)
├── 📄 insomnia-collection.json # Coleção de testes
├── 📂 prisma/
│   ├── schema.prisma        # Modelagem do Banco
│   └── seed.ts              # Dados iniciais
├── 📂 src/
│   ├── 📂 config/           # Configurações de libs
│   ├── 📂 controllers/      # Lógica de entrada/saída das rotas
│   ├── 📂 middlewares/      # Proteção de rotas e validações
│   ├── 📂 repositories/     # Acesso direto ao banco (Prisma)
│   ├── 📂 services/         # Regras de negócio
│   ├── 📂 routes/           # Definição dos endpoints
│   ├── app.ts               # Setup do Express
│   └── server.ts            # Entry point
└── ...
```

## 🐛 Troubleshooting

- **Erro de conexão com Banco/Redis**: Verifique se os containers estão rodando com `docker-compose ps`.
- **Porta em uso**: Se a porta 3000 estiver ocupada, mude no arquivo `.env`.
- **Elasticsearch erro de memória**: O Elastic exige bastante RAM. Se cair, tente aumentar o limite no Docker ou no WSL (se estiver no Windows).

---

Feito com 💜 por Marcos
