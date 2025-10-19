# 🔐 Configuração do Google OAuth

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique no menu de projetos (topo da página)
3. Clique em **"Novo Projeto"**
4. Nome: `Ludo Venda` (ou qualquer nome)
5. Clique em **"Criar"**

## Passo 2: Ativar a Google+ API

1. No menu lateral: **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Google+ API"**
3. Clique em **"Ativar"**

## Passo 3: Criar Credenciais OAuth 2.0

1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"Criar credenciais"** → **"ID do cliente OAuth 2.0"**
3. Tipo: **"Aplicativo da Web"**
4. Nome: `Ludo Venda Web Client`
5. **URIs de redirecionamento autorizados:**
   ```
   http://localhost:8000/api/auth/google/callback
   ```
6. Clique em **"Criar"**

## Passo 4: Copiar as Credenciais

Você receberá:
- **Client ID**: Algo como `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Algo como `GOCSPX-abc123xyz`

## Passo 5: Adicionar no arquivo .env

Edite o arquivo `backend/.env` e adicione:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

## Passo 6: Reconstruir o Backend

```bash
docker-compose build backend
docker-compose up -d backend
```

## Passo 7: Testar

1. Acesse: http://localhost:3000/login
2. Clique em **"Entrar com Google"**
3. Escolha sua conta Google
4. Será redirecionado e logado automaticamente!

---

## ⚠️ Importante

- O **Client ID** e **Client Secret** são sensíveis - não compartilhe
- Em produção, use domínios reais nas URIs de redirecionamento
- Mantenha o arquivo `.env` seguro e não faça commit dele no Git

