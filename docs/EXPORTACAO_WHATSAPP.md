# 📱 Exportação para WhatsApp - Documentação

## 🎯 Objetivo

Permitir que usuários exportem suas listas de vendas de jogos de tabuleiro em formato otimizado para compartilhamento no WhatsApp.

## 📋 Funcionalidades

### 1. Exportação Básica
- Formatação automática com emojis
- Informações do jogo (nome, preço, estado)
- Total da lista
- Informações de contato

### 2. Exportação Avançada
- Desconto para compra em lote
- Localização do vendedor
- Condições de frete
- Link para a lista completa
- QR Code para compartilhamento

### 3. Personalização
- Adicionar/remover informações
- Escolher emojis
- Personalizar layout
- Incluir/excluir fotos

## 🔧 Implementação

### Backend (Python)

```python
from app.services.export_service import ExportService

# Exemplo de uso
games = [
    {
        'name': 'Azul',
        'price': 150.00,
        'condition': 'new',
        'year_published': 2017,
        'min_players': 2,
        'max_players': 4,
        'playing_time': 45,
        'description': 'Jogo de azulejos estratégico'
    },
    {
        'name': 'Wingspan',
        'price': 200.00,
        'condition': 'like_new',
        'year_published': 2019,
        'min_players': 1,
        'max_players': 5,
        'playing_time': 60,
        'description': 'Jogo sobre pássaros'
    }
]

whatsapp_text = ExportService.export_to_whatsapp(
    seller_name="João Silva",
    games=games,
    total_price=350.00,
    discount_percentage=10,
    contact="(11) 99999-9999",
    location="São Paulo, SP",
    shipping_info="Frete por conta do comprador",
    list_url="https://boardgame-marketplace.com/lists/123"
)

print(whatsapp_text)
```

### Output Esperado

```
🎲 *LISTA DE VENDAS - JOÃO SILVA*

━━━━━━━━━━━━━━━━━━━━━━

📦 *Azul*
💰 Preço: *R$ 150.00*
📊 Estado: ✨ NEW
📅 Ano: 2017
👥 Jogadores: 2-4
⏱️ Tempo: 45 min
📝 Jogo de azulejos estratégico...

━━━━━━━━━━━━━━━━━━━━━━

📦 *Wingspan*
💰 Preço: *R$ 200.00*
📊 Estado: 🌟 LIKE_NEW
📅 Ano: 2019
👥 Jogadores: 1-5
⏱️ Tempo: 60 min
📝 Jogo sobre pássaros...

━━━━━━━━━━━━━━━━━━━━━━

💵 *TOTAL: R$ 350.00*
🎁 *Desconto para lote: 10%*
💎 *TOTAL COM DESCONTO: R$ 315.00*

━━━━━━━━━━━━━━━━━━━━━━

📞 *Contato:* (11) 99999-9999
📍 *Localização:* São Paulo, SP
🚚 *Frete:* Frete por conta do comprador

🔗 *Ver lista completa:* https://boardgame-marketplace.com/lists/123

━━━━━━━━━━━━━━━━━━━━━━

📅 Gerado em: 18/10/2025 19:30
```

## 🎨 Formatos de Exportação

### 1. WhatsApp
- Texto formatado com emojis
- Negrito para títulos e valores
- Separadores visuais
- Informações completas

### 2. Instagram
- Legenda otimizada
- Hashtags relevantes
- Link na bio
- Formato conciso

### 3. Facebook
- Post estruturado
- Lista numerada
- Informações resumidas
- Link para detalhes

### 4. Email
- Formato profissional
- Saudação personalizada
- Informações detalhadas
- Assinatura

### 5. QR Code
- Link direto para a lista
- Fácil compartilhamento
- Escaneamento rápido

## 🔌 API Endpoints

### POST /api/sale-lists/{id}/export

```json
{
  "format": "whatsapp",
  "include_photos": true,
  "include_contact": true,
  "include_location": true,
  "custom_message": "Mensagem personalizada"
}
```

### Response

```json
{
  "export_text": "🎲 *LISTA DE VENDAS...",
  "format": "whatsapp",
  "generated_at": "2025-10-18T19:30:00Z",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://..."
}
```

## 🎯 Casos de Uso

### 1. Vendedor Individual
- Cria lista de vendas
- Exporta para WhatsApp
- Compartilha com amigos
- Compartilha em grupos

### 2. Lojista
- Cria lista de produtos
- Exporta para WhatsApp Business
- Compartilha com clientes
- Usa QR Code em loja física

### 3. Evento
- Cria lista de jogos do evento
- Exporta para redes sociais
- Compartilha com participantes
- Gera QR Code para flyers

## 📊 Métricas

### KPIs
- Número de exportações por dia
- Formato mais usado
- Taxa de compartilhamento
- Conversão de visualizações

### Analytics
- Exportações por usuário
- Horários de pico
- Formato preferido
- Taxa de sucesso

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Exportação em PDF
- [ ] Exportação em imagem
- [ ] Templates personalizáveis
- [ ] Histórico de exportações

### Médio Prazo
- [ ] Agendamento de compartilhamento
- [ ] Integração com WhatsApp Business API
- [ ] Analytics de compartilhamento
- [ ] A/B testing de formatos

### Longo Prazo
- [ ] IA para otimização de texto
- [ ] Personalização por audiência
- [ ] Integração com outras plataformas
- [ ] Marketplace de templates

## 🐛 Troubleshooting

### Problema: Texto muito longo
**Solução**: Limitar número de jogos ou criar versão resumida

### Problema: Emojis não aparecem
**Solução**: Usar emojis Unicode compatíveis

### Problema: Formatação quebrada
**Solução**: Validar texto antes de exportar

## 📚 Referências

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Emoji Unicode](https://unicode.org/emoji/)
- [QR Code Generator](https://www.qr-code-generator.com/)

---

**Última atualização**: 18/10/2025

