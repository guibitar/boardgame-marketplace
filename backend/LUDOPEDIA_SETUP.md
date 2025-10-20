# Configuração da API da Ludopedia

## 📋 Pré-requisitos

1. Conta na [Ludopedia](https://ludopedia.com.br)
2. Acesso à documentação da API: [https://ludopedia.com.br/api/documentacao.html](https://ludopedia.com.br/api/documentacao.html)

## 🔧 Passo a Passo

### 1. Criar um Aplicativo na Ludopedia

1. Acesse: [https://ludopedia.com.br/aplicativos](https://ludopedia.com.br/aplicativos)
2. Clique em "Criar Novo Aplicativo"
3. Preencha os dados:
   - **Nome do Aplicativo**: Ludo Venda (ou outro nome de sua escolha)
   - **Descrição**: Marketplace de jogos de tabuleiro
   - **URL de Redirecionamento**: `http://localhost:3000/auth/ludopedia/callback`
   - **URL do Site**: `http://localhost:3000`
4. Clique em "Criar"

### 2. Obter Credenciais

Após criar o aplicativo, você receberá:
- `app_id`: ID do seu aplicativo
- `app_key`: Chave secreta do seu aplicativo
- `access_token`: Token de acesso inicial (para testes)

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env` do backend:

```env
# Ludopedia OAuth
LUDOPEDIA_APP_ID=seu_app_id_aqui
LUDOPEDIA_APP_KEY=sua_app_key_aqui
LUDOPEDIA_REDIRECT_URI=http://localhost:3000/auth/ludopedia/callback
```

### 4. Reiniciar o Backend

```bash
docker restart boardgame_backend
```

## 🚀 Como Usar

### No Frontend

1. Acesse a página "Minha Coleção"
2. Clique em "Importar Coleção"
3. Selecione "Ludopedia"
4. Clique em "Conectar com Ludopedia"
5. Autorize o acesso na página da Ludopedia
6. Cole o código de acesso recebido
7. Sua coleção será importada automaticamente!

## 📚 Endpoints Disponíveis

### Backend

- `GET /api/ludopedia/authorize` - Gera URL de autorização
- `POST /api/ludopedia/callback` - Callback OAuth
- `POST /api/ludopedia/import-collection` - Importa coleção completa

### Frontend

- Modal de conexão com Ludopedia
- Importação automática de coleção

## 🔒 Segurança

- O `app_key` é secreto e nunca deve ser exposto no frontend
- O `access_token` é trocado apenas no backend
- A autorização OAuth é feita em janela separada

## 📖 Documentação Completa

- [Documentação da API da Ludopedia](https://ludopedia.com.br/api/documentacao.html)
- [OpenAPI Specification](https://ludopedia.com.br/api/documentacao.html)

## ❓ Suporte

Em caso de dúvidas, entre em contato com:
- Email: api@ludopedia.com.br
- Site: [https://ludopedia.com.br](https://ludopedia.com.br)

## ✅ Checklist

- [ ] Criar aplicativo na Ludopedia
- [ ] Obter `app_id` e `app_key`
- [ ] Configurar variáveis de ambiente
- [ ] Reiniciar backend
- [ ] Testar conexão
- [ ] Importar coleção

