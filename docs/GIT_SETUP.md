# 🔧 Setup do Repositório Git

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado no computador
- Acesso ao repositório (se for privado)

## 🚀 Passos para Criar o Repositório

### 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha as informações:
   - **Repository name**: `boardgame-marketplace`
   - **Description**: Sistema web para gerenciar coleções de jogos de tabuleiro e criar listas de vendas
   - **Visibility**: ✅ **Private** (recomendado)
   - **Initialize repository**: ❌ Não marque nada (já temos arquivos)
3. Clique em **Create repository**

### 2. Configurar Git Localmente

```bash
# Navegue até a pasta do projeto
cd C:\Users\guibi\boardgame-marketplace

# Inicialize o repositório Git
git init

# Configure seu nome e email (se ainda não fez)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### 3. Adicionar Arquivos

```bash
# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: Setup do projeto BoardGame Marketplace"
```

### 4. Conectar com o GitHub

```bash
# Adicione o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/boardgame-marketplace.git

# Verifique se foi adicionado corretamente
git remote -v
```

### 5. Enviar para o GitHub

```bash
# Envie para o GitHub
git push -u origin main
```

## 📝 Comandos Git Úteis

### Ver Status
```bash
git status
```

### Adicionar Arquivos
```bash
# Adicionar arquivo específico
git add arquivo.txt

# Adicionar todos os arquivos
git add .

# Adicionar arquivos modificados
git add -u
```

### Fazer Commit
```bash
# Commit simples
git commit -m "Mensagem do commit"

# Commit com descrição
git commit -m "Título" -m "Descrição detalhada"
```

### Ver Histórico
```bash
# Ver commits
git log

# Ver commits em uma linha
git log --oneline

# Ver mudanças
git diff
```

### Criar Branches
```bash
# Criar nova branch
git checkout -b nome-da-branch

# Listar branches
git branch

# Trocar de branch
git checkout nome-da-branch

# Deletar branch
git branch -d nome-da-branch
```

### Atualizar do GitHub
```bash
# Puxar mudanças
git pull origin main

# Puxar mudanças sem merge
git fetch origin
```

### Enviar para o GitHub
```bash
# Push simples
git push

# Push para branch específica
git push origin nome-da-branch

# Push forçado (use com cuidado!)
git push -f origin main
```

## 🔄 Workflow Recomendado

### 1. Desenvolvimento Diário

```bash
# 1. Atualize sua branch
git pull origin main

# 2. Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# 3. Faça suas alterações
# ... edite arquivos ...

# 4. Adicione as mudanças
git add .

# 5. Faça commit
git commit -m "feat: adiciona nova funcionalidade"

# 6. Envie para o GitHub
git push origin feature/nome-da-feature
```

### 2. Merge de Features

```bash
# 1. Volte para main
git checkout main

# 2. Atualize main
git pull origin main

# 3. Merge sua feature
git merge feature/nome-da-feature

# 4. Envie para o GitHub
git push origin main

# 5. Delete a branch local
git branch -d feature/nome-da-feature

# 6. Delete a branch remota
git push origin --delete feature/nome-da-feature
```

## 📋 Convenções de Commit

### Formato
```
tipo(escopo): descrição

Corpo (opcional)

Rodapé (opcional)
```

### Tipos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(auth): adiciona sistema de autenticação JWT"

# Correção de bug
git commit -m "fix(export): corrige formatação do WhatsApp"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Refatoração
git commit -m "refactor(api): reorganiza estrutura de endpoints"
```

## 🔐 Segurança

### Nunca commite:
- ❌ Senhas
- ❌ API keys
- ❌ Tokens
- ❌ Credenciais
- ❌ Arquivos `.env`

### Sempre use:
- ✅ `.gitignore` (já configurado)
- ✅ Variáveis de ambiente
- ✅ `.env.example` para referência

## 🐛 Troubleshooting

### Erro: "fatal: not a git repository"
```bash
# Você não está em um repositório Git
# Navegue até a pasta do projeto
cd C:\Users\guibi\boardgame-marketplace
```

### Erro: "fatal: remote origin already exists"
```bash
# Remova o remote existente
git remote remove origin

# Adicione novamente
git remote add origin https://github.com/SEU_USUARIO/boardgame-marketplace.git
```

### Erro: "fatal: refusing to merge unrelated histories"
```bash
# Force o merge
git pull origin main --allow-unrelated-histories
```

### Erro: "fatal: Authentication failed"
```bash
# Use token de acesso pessoal
# Ou configure SSH keys
```

## 📚 Recursos Adicionais

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## 🤝 Colaboração

### Adicionar Colaboradores

1. Acesse o repositório no GitHub
2. Clique em **Settings**
3. Clique em **Collaborators**
4. Clique em **Add people**
5. Digite o username ou email
6. Clique em **Add [username] to this repository**

### Pull Requests

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Envie para o GitHub
4. Abra um Pull Request no GitHub
5. Aguarde revisão
6. Merge após aprovação

---

**Última atualização**: 18/10/2025

