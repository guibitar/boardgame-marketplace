import httpx
from typing import Optional, Dict, Any, List
from app.config import settings


class BGGService:
    """Serviço para interagir com a API do BoardGameGeek"""
    
    BASE_URL = "https://www.boardgamegeek.com/xmlapi2"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
    
    async def search_games(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Busca jogos no BoardGameGeek por nome
        
        Args:
            query: Nome do jogo para buscar
            limit: Número máximo de resultados
            
        Returns:
            Lista de jogos encontrados
        """
        try:
            url = f"{self.BASE_URL}/search"
            params = {
                "query": query,
                "type": "boardgame",
                "exact": 0
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            # Parse XML response
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.text)
            
            games = []
            for item in root.findall("item")[:limit]:
                game_id = item.get("id")
                name = item.find("name")
                name_value = name.get("value") if name is not None else "Unknown"
                
                games.append({
                    "bgg_id": int(game_id),
                    "name": name_value,
                    "type": item.get("type")
                })
            
            return games
            
        except Exception as e:
            print(f"Erro ao buscar jogos no BGG: {e}")
            return []
    
    async def get_game_details(self, bgg_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca informações detalhadas de um jogo pelo ID do BGG
        
        Args:
            bgg_id: ID do jogo no BoardGameGeek
            
        Returns:
            Dados do jogo ou None se não encontrado
        """
        try:
            url = f"{self.BASE_URL}/thing"
            params = {
                "id": bgg_id,
                "stats": 1
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            # Parse XML response
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.text)
            
            item = root.find("item")
            if item is None:
                return None
            
            # Extrair informações básicas
            name = item.find("name[@type='primary']")
            name_value = name.get("value") if name is not None else "Unknown"
            
            description = item.find("description")
            description_value = description.text if description is not None else ""
            
            # Extrair ano de publicação
            year_published = None
            yearpublished = item.find("yearpublished")
            if yearpublished is not None:
                year_published = int(yearpublished.get("value", 0))
            
            # Extrair estatísticas
            min_players = None
            max_players = None
            min_playtime = None
            max_playtime = None
            min_age = None
            
            for link in item.findall("link[@type='boardgamecategory']"):
                pass  # Podemos usar isso para categorias
            
            for poll in item.findall("poll[@name='suggested_numplayers']"):
                for results in poll.findall("results"):
                    numplayers = results.get("numplayers")
                    if numplayers:
                        if "+" in numplayers:
                            # "4+" format
                            min_players = int(numplayers.replace("+", ""))
                        else:
                            # "2-4" format
                            parts = numplayers.split("-")
                            if len(parts) == 2:
                                min_players = int(parts[0])
                                max_players = int(parts[1])
                            else:
                                min_players = int(parts[0])
                                max_players = int(parts[0])
            
            for poll in item.findall("poll[@name='suggested_playerage']"):
                for results in poll.findall("results"):
                    value = results.get("value")
                    if value:
                        min_age = int(value)
                        break
            
            # Extrair tempo de jogo
            minplaytime = item.find("minplaytime")
            if minplaytime is not None:
                min_playtime = int(minplaytime.get("value", 0))
            
            maxplaytime = item.find("maxplaytime")
            if maxplaytime is not None:
                max_playtime = int(maxplaytime.get("value", 0))
            
            # Extrair rating
            rating = None
            statistics = item.find("statistics/ratings/average")
            if statistics is not None:
                rating = round(float(statistics.get("value", 0)), 2)
            
            # Extrair peso (complexidade)
            weight = None
            statistics = item.find("statistics/ratings/averageweight")
            if statistics is not None:
                weight = round(float(statistics.get("value", 0)), 2)
            
            # Extrair imagem
            image_url = None
            image = item.find("image")
            if image is not None:
                image_url = image.text
            
            return {
                "bgg_id": bgg_id,
                "name": name_value,
                "description": description_value,
                "year_published": year_published,
                "min_players": min_players,
                "max_players": max_players,
                "min_playtime": min_playtime,
                "max_playtime": max_playtime,
                "min_age": min_age,
                "rating": rating,
                "weight": weight,
                "image_url": image_url
            }
            
        except Exception as e:
            print(f"Erro ao buscar detalhes do jogo {bgg_id} no BGG: {e}")
            return None
    
    async def get_user_collection(self, bgg_username: str) -> List[Dict[str, Any]]:
        """
        Importa a coleção de um usuário do BoardGameGeek
        
        Args:
            bgg_username: Nome de usuário no BoardGameGeek
            
        Returns:
            Lista de jogos da coleção do usuário
        """
        try:
            url = f"{self.BASE_URL}/collection"
            params = {
                "username": bgg_username,
                "own": 1,  # Apenas jogos que o usuário possui
                "stats": 1
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            # Parse XML response
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.text)
            
            games = []
            for item in root.findall("item"):
                game_id = item.get("objectid")
                
                # Extrair nome
                name = item.find("name")
                name_value = name.text if name is not None else "Unknown"
                
                # Extrair estatísticas
                stats = item.find("stats")
                min_players = None
                max_players = None
                min_playtime = None
                max_playtime = None
                min_age = None
                rating = None
                weight = None
                year_published = None
                
                if stats is not None:
                    minplayers = stats.find("minplayers")
                    if minplayers is not None:
                        min_players = int(minplayers.get("value", 0))
                    
                    maxplayers = stats.find("maxplayers")
                    if maxplayers is not None:
                        max_players = int(maxplayers.get("value", 0))
                    
                    minplaytime = stats.find("minplaytime")
                    if minplaytime is not None:
                        min_playtime = int(minplaytime.get("value", 0))
                    
                    maxplaytime = stats.find("maxplaytime")
                    if maxplaytime is not None:
                        max_playtime = int(maxplaytime.get("value", 0))
                    
                    minage = stats.find("minage")
                    if minage is not None:
                        min_age = int(minage.get("value", 0))
                    
                    rating_elem = stats.find("rating/average")
                    if rating_elem is not None:
                        rating = round(float(rating_elem.get("value", 0)), 2)
                    
                    weight_elem = stats.find("rating/averageweight")
                    if weight_elem is not None:
                        weight = round(float(weight_elem.get("value", 0)), 2)
                
                # Extrair ano de publicação
                yearpublished = item.find("yearpublished")
                if yearpublished is not None:
                    year_published = int(yearpublished.get("value", 0))
                
                games.append({
                    "bgg_id": int(game_id),
                    "name": name_value,
                    "year_published": year_published,
                    "min_players": min_players,
                    "max_players": max_players,
                    "min_playtime": min_playtime,
                    "max_playtime": max_playtime,
                    "min_age": min_age,
                    "rating": rating,
                    "weight": weight
                })
            
            return games
            
        except Exception as e:
            print(f"Erro ao importar coleção do usuário {bgg_username} do BGG: {e}")
            return []
    
    def close(self):
        """Fecha a conexão HTTP"""
        self.client.close()


# Instância global do serviço
bgg_service = BGGService()

