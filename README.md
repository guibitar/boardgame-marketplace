# 🎲 BoardGame Marketplace

Sistema web para gerenciar coleções de jogos de tabuleiro e criar listas de vendas com exportação para WhatsApp e redes sociais.

## 🎯 Objetivo Principal

Facilitar a montagem e compartilhamento de listas de vendas de jogos de tabuleiro novos e usados, com foco em exportação para WhatsApp e redes sociais.

## 🚀 Funcionalidades Principais

### ✅ Implementado
- ✅ **Sistema de Autenticação Completo**
  - Login com usuário/senha
  - Login com Google OAuth2
  - Registro de usuários
  - Seleção de planos (Gratuito, Premium, Pro)
  - Gerenciamento de estado com Redux
- ✅ **Interface Moderna**
  - Design Bootstrap 5
  - Máscaras de formatação (Telefone e CEP)
  - Validação de formulários
  - Responsivo e acessível
- ✅ **Sistema de Coleção de Jogos**
  - CRUD completo de jogos
  - Importação da Ludopedia (OAuth 2.0)
  - Importação do BoardGameGeek
  - Identificação automática de BASE vs EXPANSION
  - Ordenação e filtros
  - Visualização em cards ou lista
  - Modal de progresso durante sincronização
  - Campos completos (rating, weight, ranking_position, purchase_price)

### 🚧 Em Desenvolvimento
- 🔄 Criação de listas de vendas
- 🔄 **Exportação para WhatsApp** ⭐
- 🔄 **Exportação para redes sociais** ⭐
- 🔄 Sistema de limites por plano
- 🔄 Busca de jogos
- 🔄 Chat entre comprador e vendedor

## 🏗️ Stack Tecnológico

### Backend
- **FastAPI** (Python) - Framework moderno e assíncrono
- **SQLAlchemy** - ORM
- **PostgreSQL** - Banco de dados
- **Redis** - Cache
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Google OAuth2** - Login social

### Frontend
- **React.js** (TypeScript) - Interface moderna
- **Redux Toolkit** - Gerenciamento de estado
- **Bootstrap 5** - Design responsivo
- **React Router DOM** - Navegação
- **Axios** - Requisições HTTP

### Infraestrutura
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Railway.app** - Hospedagem backend (gratuito)
- **Vercel** - Hospedagem frontend (gratuito)
- **Supabase** - PostgreSQL (gratuito)

## 📁 Estrutura do Projeto

```
boardgame-marketplace/
├── backend/          # API FastAPI
├── frontend/         # React App
├── docs/            # Documentação
└── docker-compose.yml
```

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Python 3.11+
- Node.js 18+
- Conta Google Cloud (para OAuth)

### Desenvolvimento

```bash
# Clone o repositório
git clone [URL_DO_REPO]

# Entre no diretório
cd boardgame-marketplace

# Configure as variáveis de ambiente
# Copie backend/.env.example para backend/.env
# Adicione suas credenciais do Google OAuth

# Inicie os containers
docker-compose up -d

# Backend estará em http://localhost:8000
# Frontend estará em http://localhost:3000
```

### 📝 Configuração do Google OAuth

Consulte o arquivo `backend/GOOGLE_OAUTH_SETUP.md` para instruções detalhadas sobre como configurar o Google OAuth2.

## 📚 Documentação

Consulte a pasta `docs/` para documentação completa:
- Planejamento do sistema
- Detalhamento técnico
- Diagramas e fluxos
- Resumo executivo

## 💰 Modelo de Negócio

### Plano Gratuito
- 3 listas ativas simultâneas
- 5 jogos por lista
- Exportação ilimitada
- Anúncios discretos

### Plano Premium (R$ 19,90/mês)
- Listas ilimitadas
- 20 jogos por lista
- Sem anúncios
- Estatísticas

### Plano Pro (R$ 49,90/mês)
- Listas ilimitadas
- Jogos ilimitados
- Analytics completo
- API própria

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento solo com assistência de IA.

## 📄 Licença

Proprietário - Todos os direitos reservados

## 👤 Desenvolvedor

Desenvolvido por você com assistência de IA 🤖

---

**Desenvolvido com ❤️ para a comunidade de jogos de tabuleiro**
