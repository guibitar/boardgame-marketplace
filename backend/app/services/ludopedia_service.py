import httpx
from typing import Optional, Dict, Any, List
from app.config import settings


class LudopediaService:
    """Serviço para interagir com a API da Ludopedia"""
    
    BASE_URL = "https://ludopedia.com.br/api/v1"
    OAUTH_URL = "https://ludopedia.com.br/oauth"
    TOKEN_URL = "https://ludopedia.com.br/tokenrequest"
    
    def __init__(self):
        self.app_id = getattr(settings, 'LUDOPEDIA_APP_ID', None)
        self.app_key = getattr(settings, 'LUDOPEDIA_APP_KEY', None)
        self.redirect_uri = getattr(settings, 'LUDOPEDIA_REDIRECT_URI', 'http://localhost:3000/auth/ludopedia/callback')
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
    
    async def search_games(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Busca jogos na Ludopedia por nome
        
        Args:
            query: Nome do jogo para buscar
            limit: Número máximo de resultados
            
        Returns:
            Lista de jogos encontrados
        """
        try:
            url = f"{self.BASE_URL}/jogos"
            params = {
                "search": query,
                "rows": min(limit, 100)  # Máximo 100 por página
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            games = []
            
            for jogo in data.get("jogos", [])[:limit]:
                games.append({
                    "ludopedia_id": jogo.get("id_jogo"),
                    "name": jogo.get("nm_jogo"),
                    "year_published": jogo.get("ano_publicacao"),
                    "image_url": jogo.get("thumb"),
                    "min_players": jogo.get("qt_jogadores_min"),
                    "max_players": jogo.get("qt_jogadores_max"),
                    "min_playtime": jogo.get("vl_tempo_jogo"),
                    "max_playtime": jogo.get("vl_tempo_jogo"),
                    "min_age": jogo.get("idade_minima"),
                })
            
            return games
            
        except Exception as e:
            print(f"Erro ao buscar jogos na Ludopedia: {e}")
            return []
    
    async def get_game_by_id(self, ludopedia_id: int, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Busca informações detalhadas de um jogo pelo ID da Ludopedia
        
        Args:
            ludopedia_id: ID do jogo na Ludopedia
            access_token: Token de acesso OAuth
            
        Returns:
            Dados do jogo ou None se não encontrado
        """
        try:
            url = f"{self.BASE_URL}/jogos/{ludopedia_id}"
            headers = {
                "Authorization": f"Bearer {access_token}"
            }
            
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            
            jogo = response.json()
            
            # Debug: imprimir todos os campos disponíveis
            print(f"DEBUG GAME DETAILS - Jogo {ludopedia_id}: {jogo.get('nm_jogo')}")
            print(f"DEBUG GAME DETAILS - tp_jogo: {jogo.get('tp_jogo')}")
            
            return {
                "ludopedia_id": jogo.get("id_jogo"),
                "name": jogo.get("nm_jogo"),
                "year_published": jogo.get("ano_publicacao"),
                "image_url": jogo.get("thumb"),
                "min_players": jogo.get("qt_jogadores_min"),
                "max_players": jogo.get("qt_jogadores_max"),
                "min_playtime": jogo.get("vl_tempo_jogo"),
                "max_playtime": jogo.get("vl_tempo_jogo"),
                "min_age": jogo.get("idade_minima"),
                "game_type": jogo.get("tp_jogo"),  # Tipo de jogo da Ludopedia
                "rating": jogo.get("vl_nota"),  # Nota do jogo
                "weight": jogo.get("vl_peso"),  # Complexidade (peso)
                "ranking_position": jogo.get("posicao_ranking"),  # Posição no ranking
                "description": jogo.get("ds_jogo"),  # Descrição do jogo
            }
            
        except Exception as e:
            print(f"Erro ao buscar jogo {ludopedia_id} na Ludopedia: {e}")
            return None
    
    async def get_user_collection(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Importa a coleção do usuário autenticado na Ludopedia
        
        Args:
            access_token: Token de acesso OAuth
            
        Returns:
            Lista de jogos da coleção do usuário
        """
        try:
            url = f"{self.BASE_URL}/colecao"
            headers = {
                "Authorization": f"Bearer {access_token}"
            }
            params = {
                "lista": "colecao",
                "rows": 100  # Máximo por página
            }
            
            all_games = []
            page = 1
            
            while True:
                params["page"] = page
                response = await self.client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                print(f"DEBUG Ludopedia - Resposta da API (página {page}): {data}")
                games = data.get("colecao", [])
                
                if not games:
                    print(f"DEBUG Ludopedia - Nenhum jogo encontrado na página {page}")
                    break
                
                for jogo in games:
                    # Pula jogos sem nome
                    nome = jogo.get("nm_jogo")
                    if not nome or nome.strip() == "":
                        continue
                    
                    # Buscar detalhes do jogo para obter informações completas
                    game_details = await self.get_game_by_id(jogo.get("id_jogo"), access_token)
                    
                    if game_details:
                        # Usar dados dos detalhes do jogo
                        tp_jogo = game_details.get("game_type")
                        
                        # Se tp_jogo for "E" ou "EXPANSION", é expansão
                        if tp_jogo == "E" or tp_jogo == "EXPANSION" or tp_jogo == "Expansão":
                            game_type = "EXPANSION"
                        else:
                            game_type = "BASE"
                        
                        # Usar dados dos detalhes ou da lista como fallback
                        all_games.append({
                            "ludopedia_id": jogo.get("id_jogo"),
                            "name": nome,
                            "description": game_details.get("description") or jogo.get("ds_jogo"),
                            "year_published": game_details.get("year_published") or jogo.get("ano_lancamento") or jogo.get("ano_publicacao"),
                            "game_type": game_type,
                            "base_game_id": None,  # Não disponível na API da Ludopedia
                            "base_game_name": None,  # Não disponível na API da Ludopedia
                            "purchase_price": jogo.get("vl_custo"),
                            "image_url": game_details.get("image_url") or jogo.get("thumb"),
                            "min_players": game_details.get("min_players") or jogo.get("qt_jogadores_min"),
                            "max_players": game_details.get("max_players") or jogo.get("qt_jogadores_max"),
                            "min_playtime": game_details.get("min_playtime") or jogo.get("vl_tempo_jogo"),
                            "max_playtime": game_details.get("max_playtime") or jogo.get("vl_tempo_jogo"),
                            "min_age": game_details.get("min_age") or jogo.get("idade_minima"),
                            "rating": game_details.get("rating"),  # Nota do jogo
                            "weight": game_details.get("weight"),  # Complexidade
                            "ranking_position": game_details.get("ranking_position"),  # Posição no ranking
                            "order": len(all_games),  # Ordem original da Ludopedia
                        })
                        
                        # Debug: imprimir alguns jogos para verificar campos
                        if len(all_games) <= 3:
                            print(f"DEBUG Ludopedia - Jogo exemplo: {nome}, tp_jogo: {tp_jogo}, game_type: {game_type}, rating: {game_details.get('rating')}, weight: {game_details.get('weight')}")
                    else:
                        # Fallback: usar apenas dados da lista se detalhes não estiverem disponíveis
                        all_games.append({
                            "ludopedia_id": jogo.get("id_jogo"),
                            "name": nome,
                            "description": jogo.get("ds_jogo"),
                            "year_published": jogo.get("ano_lancamento") or jogo.get("ano_publicacao"),
                            "game_type": "BASE",  # Assumir BASE se não conseguir buscar detalhes
                            "base_game_id": None,
                            "base_game_name": None,
                            "purchase_price": jogo.get("vl_custo"),
                            "image_url": jogo.get("thumb"),
                            "min_players": jogo.get("qt_jogadores_min"),
                            "max_players": jogo.get("qt_jogadores_max"),
                            "min_playtime": jogo.get("vl_tempo_jogo"),
                            "max_playtime": jogo.get("vl_tempo_jogo"),
                            "min_age": jogo.get("idade_minima"),
                            "rating": None,
                            "weight": None,
                            "ranking_position": None,
                            "order": len(all_games),
                        })
                    
                    # Pequeno delay para evitar rate limiting
                    import asyncio
                    await asyncio.sleep(0.5)  # 500ms entre requisições
                
                # Se retornou menos que o máximo, chegamos ao fim
                if len(games) < 100:
                    break
                
                page += 1
            
            print(f"DEBUG Ludopedia - Total de jogos encontrados: {len(all_games)}")
            return all_games
            
        except Exception as e:
            print(f"Erro ao importar coleção da Ludopedia: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def close(self):
        """Fecha a conexão HTTP"""
        self.client.close()


# Instância global do serviço
ludopedia_service = LudopediaService()

