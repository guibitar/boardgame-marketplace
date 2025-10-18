from typing import List, Dict, Optional
from datetime import datetime


class ExportService:
    """Serviço para exportar listas de vendas em diferentes formatos"""
    
    @staticmethod
    def export_to_whatsapp(
        seller_name: str,
        games: List[Dict],
        total_price: float,
        discount_percentage: Optional[float] = None,
        contact: Optional[str] = None,
        location: Optional[str] = None,
        shipping_info: Optional[str] = None,
        list_url: Optional[str] = None
    ) -> str:
        """
        Exporta lista de vendas formatada para WhatsApp
        
        Args:
            seller_name: Nome do vendedor
            games: Lista de jogos com informações
            total_price: Preço total da lista
            discount_percentage: Percentual de desconto para lote
            contact: Informações de contato
            location: Localização do vendedor
            shipping_info: Informações de frete
            list_url: URL da lista na plataforma
            
        Returns:
            String formatada para WhatsApp
        """
        text = f"🎲 *LISTA DE VENDAS - {seller_name.upper()}*\n\n"
        text += "━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        for idx, game in enumerate(games, 1):
            text += f"📦 *{game['name']}*\n"
            text += f"💰 Preço: *R$ {game['price']:.2f}*\n"
            
            if game.get('condition'):
                condition_emoji = {
                    'new': '✨',
                    'like_new': '🌟',
                    'good': '👍',
                    'fair': '⚡'
                }
                emoji = condition_emoji.get(game['condition'], '📦')
                text += f"📊 Estado: {emoji} {game['condition'].upper()}\n"
            
            if game.get('year_published'):
                text += f"📅 Ano: {game['year_published']}\n"
            
            if game.get('min_players') and game.get('max_players'):
                text += f"👥 Jogadores: {game['min_players']}-{game['max_players']}\n"
            
            if game.get('playing_time'):
                text += f"⏱️ Tempo: {game['playing_time']} min\n"
            
            if game.get('description'):
                text += f"📝 {game['description'][:100]}...\n"
            
            text += "\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        # Total
        text += f"💵 *TOTAL: R$ {total_price:.2f}*\n"
        
        if discount_percentage and discount_percentage > 0:
            discount_amount = total_price * (discount_percentage / 100)
            final_price = total_price - discount_amount
            text += f"🎁 *Desconto para lote: {discount_percentage}%*\n"
            text += f"💎 *TOTAL COM DESCONTO: R$ {final_price:.2f}*\n"
        
        text += "\n━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        # Informações adicionais
        if contact:
            text += f"📞 *Contato:* {contact}\n"
        
        if location:
            text += f"📍 *Localização:* {location}\n"
        
        if shipping_info:
            text += f"🚚 *Frete:* {shipping_info}\n"
        
        if list_url:
            text += f"\n🔗 *Ver lista completa:* {list_url}\n"
        
        text += "\n━━━━━━━━━━━━━━━━━━━━━━\n"
        text += f"\n📅 Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n"
        
        return text
    
    @staticmethod
    def export_to_instagram(
        seller_name: str,
        games: List[Dict],
        total_price: float,
        list_url: Optional[str] = None
    ) -> str:
        """
        Exporta lista formatada para Instagram (legenda)
        """
        text = f"🎲 LISTA DE VENDAS - {seller_name}\n\n"
        
        for game in games:
            text += f"📦 {game['name']}\n"
            text += f"💰 R$ {game['price']:.2f}\n"
            if game.get('condition'):
                text += f"📊 {game['condition'].upper()}\n"
            text += "\n"
        
        text += f"💵 TOTAL: R$ {total_price:.2f}\n\n"
        
        if list_url:
            text += f"🔗 Link na bio: {list_url}\n\n"
        
        text += "#jogosdetabuleiro #boardgames #venda #colecao"
        
        return text
    
    @staticmethod
    def export_to_facebook(
        seller_name: str,
        games: List[Dict],
        total_price: float,
        list_url: Optional[str] = None
    ) -> str:
        """
        Exporta lista formatada para Facebook (post)
        """
        text = f"🎲 Lista de Vendas - {seller_name}\n\n"
        text += "Confira os jogos de tabuleiro disponíveis:\n\n"
        
        for idx, game in enumerate(games, 1):
            text += f"{idx}. {game['name']} - R$ {game['price']:.2f}\n"
            if game.get('condition'):
                text += f"   Estado: {game['condition'].upper()}\n"
        
        text += f"\n💰 Total: R$ {total_price:.2f}\n"
        
        if list_url:
            text += f"\n🔗 Ver detalhes: {list_url}\n"
        
        return text
    
    @staticmethod
    def export_to_email(
        seller_name: str,
        games: List[Dict],
        total_price: float,
        buyer_name: Optional[str] = None
    ) -> str:
        """
        Exporta lista formatada para email
        """
        greeting = f"Olá {buyer_name}," if buyer_name else "Olá,"
        
        text = f"""
{greeting}

Você está recebendo a lista de vendas de {seller_name}:

"""
        
        for idx, game in enumerate(games, 1):
            text += f"{idx}. {game['name']}\n"
            text += f"   Preço: R$ {game['price']:.2f}\n"
            if game.get('condition'):
                text += f"   Estado: {game['condition'].upper()}\n"
            if game.get('description'):
                text += f"   Descrição: {game['description']}\n"
            text += "\n"
        
        text += f"Total: R$ {total_price:.2f}\n\n"
        text += "Atenciosamente,\nBoardGame Marketplace"
        
        return text
    
    @staticmethod
    def generate_qr_code_data(list_url: str) -> Dict:
        """
        Gera dados para QR Code da lista
        
        Args:
            list_url: URL da lista
            
        Returns:
            Dicionário com dados do QR Code
        """
        return {
            "url": list_url,
            "type": "url",
            "size": "medium",
            "format": "png"
        }

