# 🎨 Guia Visual - BoardGame Marketplace

## 📊 Estrutura do Projeto

```
boardgame-marketplace/
│
├── 📄 README.md                    # Documentação principal
├── 📄 RESUMO_PROJETO.md            # Este resumo
├── 📄 GUIA_VISUAL.md               # Guia visual
├── 📄 .gitignore                   # Arquivos ignorados pelo Git
├── 🐳 docker-compose.yml           # Orquestração Docker
│
├── 🐍 backend/                     # API FastAPI (Python)
│   ├── 📄 requirements.txt         # Dependências Python
│   ├── 🐳 Dockerfile               # Container Docker
│   ├── 📄 .env.example             # Variáveis de ambiente
│   │
│   ├── 📁 app/                     # Código da aplicação
│   │   ├── 📄 main.py              # Entry point
│   │   ├── 📄 config.py            # Configurações
│   │   ├── 📄 database.py          # Conexão com banco
│   │   │
│   │   ├── 📁 api/                 # Endpoints (a criar)
│   │   ├── 📁 models/              # Modelos SQLAlchemy (a criar)
│   │   ├── 📁 schemas/             # Schemas Pydantic (a criar)
│   │   ├── 📁 services/            # Serviços de negócio
│   │   │   └── ⭐ export_service.py  # Exportação WhatsApp
│   │   ├── 📁 utils/               # Utilitários (a criar)
│   │   └── 📁 core/                # Configurações (a criar)
│   │
│   └── 📁 tests/                   # Testes
│
├── ⚛️ frontend/                    # React App (TypeScript)
│   ├── 📄 package.json             # Dependências Node
│   ├── 🐳 Dockerfile               # Container Docker
│   ├── 📄 vite.config.ts           # Configuração Vite
│   ├── 📄 tailwind.config.js       # Configuração Tailwind
│   ├── 📄 tsconfig.json            # Configuração TypeScript
│   ├── 📄 index.html               # HTML principal
│   │
│   ├── 📁 public/                  # Arquivos estáticos
│   │
│   └── 📁 src/                     # Código fonte
│       ├── 📄 main.tsx             # Entry point
│       ├── 📄 App.tsx              # Componente principal
│       ├── 📄 index.css            # Estilos Tailwind
│       │
│       ├── 📁 components/          # Componentes React (a criar)
│       ├── 📁 pages/               # Páginas (a criar)
│       ├── 📁 services/            # Serviços
│       │   └── 📄 api.ts           # Cliente HTTP
│       ├── 📁 store/               # Redux Store
│       │   └── 📄 index.ts         # Configuração Redux
│       ├── 📁 hooks/               # Custom hooks (a criar)
│       ├── 📁 utils/               # Utilitários (a criar)
│       └── 📁 types/               # TypeScript types (a criar)
│
└── 📚 docs/                        # Documentação
    ├── 📄 INICIO_RAPIDO.md         # Como começar
    ├── 📄 ROADMAP.md               # Roadmap de desenvolvimento
    ├── 📄 EXPORTACAO_WHATSAPP.md   # ⭐ Doc exportação
    └── 📄 GIT_SETUP.md             # Setup do Git
```

## 🎯 Fluxo de Desenvolvimento

### 1️⃣ Setup Inicial
```
┌─────────────────────────────────────────┐
│  Criar Repositório Git                  │
│  (docs/GIT_SETUP.md)                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Iniciar Docker Compose                 │
│  docker-compose up -d                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Verificar se está funcionando          │
│  curl http://localhost:8000/health      │
└─────────────────────────────────────────┘
```

### 2️⃣ Desenvolvimento Backend
```
┌─────────────────────────────────────────┐
│  Criar Modelos (models/)                │
│  - User, Collection, SaleList, etc.     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Criar Schemas (schemas/)               │
│  - UserSchema, CollectionSchema, etc.   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Criar Endpoints (api/)                 │
│  - auth.py, collections.py, etc.        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Testar Endpoints                       │
│  http://localhost:8000/docs             │
└─────────────────────────────────────────┘
```

### 3️⃣ Desenvolvimento Frontend
```
┌─────────────────────────────────────────┐
│  Criar Componentes (components/)        │
│  - Button, Card, Input, etc.            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Criar Páginas (pages/)                 │
│  - Login, Collection, SaleList, etc.    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Integrar com API                       │
│  services/api.ts                        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Testar Interface                       │
│  http://localhost:3000                  │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - Interface de usuário                 │
│  - Redux Store                          │
│  - Serviços HTTP                        │
└──────┬──────────────────────────────────┘
       │
       │ HTTP Request
       ▼
┌─────────────────────────────────────────┐
│         Backend (FastAPI)               │
│  - Endpoints                            │
│  - Validação (Pydantic)                 │
│  - Lógica de negócio                    │
└──────┬──────────────────────────────────┘
       │
       │ SQL Query
       ▼
┌─────────────────────────────────────────┐
│         PostgreSQL                      │
│  - Dados dos usuários                   │
│  - Coleções                             │
│  - Listas de vendas                     │
└─────────────────────────────────────────┘
```

## 🎨 Arquitetura de Componentes

### Backend
```
app/
├── main.py              # FastAPI app
├── config.py            # Configurações
├── database.py          # Conexão DB
│
├── api/                 # Endpoints
│   ├── auth.py         # Autenticação
│   ├── users.py        # Usuários
│   ├── collections.py  # Coleções
│   ├── sale_lists.py   # Listas de vendas
│   └── orders.py       # Pedidos
│
├── models/              # SQLAlchemy
│   ├── user.py
│   ├── collection.py
│   ├── sale_list.py
│   └── order.py
│
├── schemas/             # Pydantic
│   ├── user.py
│   ├── collection.py
│   ├── sale_list.py
│   └── order.py
│
├── services/            # Lógica de negócio
│   ├── export_service.py    # ⭐ Exportação
│   ├── ludopedia_service.py # Ludopedia API
│   └── bgg_service.py       # BGG API
│
└── utils/               # Utilitários
    ├── auth.py          # JWT
    └── validators.py    # Validações
```

### Frontend
```
src/
├── main.tsx             # Entry point
├── App.tsx              # App principal
├── index.css            # Estilos
│
├── components/          # Componentes
│   ├── common/         # Componentes comuns
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── collection/     # Coleção
│   │   ├── GameCard.tsx
│   │   └── CollectionList.tsx
│   └── sale-list/      # Listas de vendas
│       ├── SaleListCard.tsx
│       └── ExportButton.tsx
│
├── pages/              # Páginas
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Collection.tsx
│   ├── SaleList.tsx
│   └── Search.tsx
│
├── services/           # Serviços
│   └── api.ts         # Cliente HTTP
│
├── store/             # Redux
│   ├── index.ts       # Store principal
│   └── slices/        # Slices
│       ├── authSlice.ts
│       ├── collectionSlice.ts
│       └── saleListSlice.ts
│
├── hooks/             # Custom hooks
│   ├── useAuth.ts
│   └── useCollection.ts
│
├── utils/             # Utilitários
│   ├── formatters.ts
│   └── validators.ts
│
└── types/             # TypeScript
    ├── user.ts
    ├── collection.ts
    └── sale-list.ts
```

## 🚀 Comandos Rápidos

### Docker
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir
docker-compose build
```

### Backend
```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
uvicorn app.main:app --reload

# Testes
pytest

# Formatar código
black app/
```

### Frontend
```bash
# Instalar dependências
npm install

# Rodar servidor
npm run dev

# Build
npm run build

# Testes
npm test

# Formatar código
npm run format
```

### Git
```bash
# Status
git status

# Adicionar
git add .

# Commit
git commit -m "mensagem"

# Push
git push

# Pull
git pull
```

## 📊 Status do Projeto

### ✅ Concluído
- [x] Planejamento
- [x] Estrutura do projeto
- [x] Docker Compose
- [x] Backend básico
- [x] Frontend básico
- [x] ⭐ Serviço de exportação
- [x] Documentação

### 🔄 Em Progresso
- [ ] Autenticação
- [ ] Coleção de jogos
- [ ] Listas de vendas

### ⏳ Planejado
- [ ] Sistema de ofertas
- [ ] Avaliações
- [ ] Pagamentos
- [ ] Dashboard

## 🎯 Próximos Passos

1. **Criar Repositório Git**
   - Siga `docs/GIT_SETUP.md`

2. **Testar Setup**
   - `docker-compose up -d`
   - Verifique http://localhost:8000/health

3. **Desenvolver MVP**
   - Siga `docs/ROADMAP.md`
   - Comece pela autenticação

4. **Integrar Exportação**
   - Use `app/services/export_service.py`
   - Crie endpoint de exportação
   - Crie interface de exportação

---

**Boa sorte com o desenvolvimento! 🎲**

