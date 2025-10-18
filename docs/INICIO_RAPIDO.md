# 🚀 Início Rápido - BoardGame Marketplace

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** e **Docker Compose** (recomendado)
- **Python 3.11+** (se não usar Docker)
- **Node.js 18+** (se não usar Docker)
- **Git**

## 🐳 Opção 1: Usando Docker (Recomendado)

### 1. Clone o repositório

```bash
git clone [URL_DO_REPO]
cd boardgame-marketplace
```

### 2. Configure as variáveis de ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Inicie os containers

```bash
# Volte para a raiz do projeto
cd ..

# Inicie todos os serviços
docker-compose up -d
```

### 4. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 5. Parar os containers

```bash
docker-compose down
```

## 💻 Opção 2: Desenvolvimento Local (Sem Docker)

### Backend

```bash
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env

# Inicie o servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📚 Próximos Passos

### 1. Verificar se tudo está funcionando

```bash
# Backend
curl http://localhost:8000/health
# Deve retornar: {"status": "healthy"}

# Frontend
# Acesse http://localhost:3000
```

### 2. Criar as tabelas do banco de dados

```bash
# Com Docker
docker-compose exec backend python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Sem Docker
cd backend
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 3. Executar migrações (quando disponível)

```bash
# Com Docker
docker-compose exec backend alembic upgrade head

# Sem Docker
cd backend
alembic upgrade head
```

## 🧪 Testes

### Backend

```bash
# Com Docker
docker-compose exec backend pytest

# Sem Docker
cd backend
pytest
```

### Frontend

```bash
# Com Docker
docker-compose exec frontend npm test

# Sem Docker
cd frontend
npm test
```

## 🛠️ Comandos Úteis

### Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Reiniciar um serviço
docker-compose restart backend

# Reconstruir imagens
docker-compose build

# Limpar tudo
docker-compose down -v
```

### Backend

```bash
# Formatar código
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

### Frontend

```bash
# Formatar código
npm run format

# Lint
npm run lint

# Build de produção
npm run build
```

## 🐛 Troubleshooting

### Erro: Porta já em uso

```bash
# Altere as portas no docker-compose.yml
# Ou pare o processo que está usando a porta
```

### Erro: Banco de dados não conecta

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Verifique os logs
docker-compose logs db
```

### Erro: Dependências não instaladas

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## 📖 Documentação Adicional

- [Planejamento do Sistema](../SISTEMA_PLANEJAMENTO_ATUALIZADO.md)
- [Detalhamento Técnico](../DETALHAMENTO_TECNICO.md)
- [Diagramas e Fluxos](../DIAGRAMAS_E_FLUXOS.md)
- [Resumo Executivo](../RESUMO_EXECUTIVO.md)

## 🤝 Suporte

Se tiver problemas, verifique:

1. Os logs dos containers: `docker-compose logs`
2. A documentação completa em `docs/`
3. Os issues no repositório

---

**Boa sorte com o desenvolvimento! 🎲**

