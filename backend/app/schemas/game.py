from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.game import GameType


class GameBase(BaseModel):
    """Schema base para jogo"""
    name: str = Field(..., min_length=1, max_length=200, description="Nome do jogo")
    description: Optional[str] = Field(None, description="Descrição do jogo")
    year_published: Optional[int] = Field(None, ge=0, le=2100, description="Ano de publicação (0 se não informado)")
    game_type: GameType = Field(GameType.BASE, description="Tipo de jogo (base ou expansão)")
    base_game_id: Optional[int] = Field(None, description="ID do jogo base se for expansão")
    
    # Dados de importação
    ludopedia_id: Optional[int] = Field(None, description="ID do jogo na Ludopedia")
    bgg_id: Optional[int] = Field(None, description="ID do jogo no BoardGameGeek")
    order: Optional[int] = Field(None, description="Ordem original da Ludopedia")
    
    # Metadados
    min_players: Optional[int] = Field(None, ge=1, description="Número mínimo de jogadores")
    max_players: Optional[int] = Field(None, ge=1, description="Número máximo de jogadores")
    min_playtime: Optional[int] = Field(None, ge=1, description="Tempo mínimo de jogo (minutos)")
    max_playtime: Optional[int] = Field(None, ge=1, description="Tempo máximo de jogo (minutos)")
    min_age: Optional[int] = Field(None, ge=0, description="Idade mínima recomendada")
    rating: Optional[float] = Field(None, ge=0, le=10, description="Avaliação do jogo")
    weight: Optional[float] = Field(None, ge=0, le=5, description="Complexidade do jogo (BGG)")
    ranking_position: Optional[int] = Field(None, ge=1, description="Posição no ranking")
    
    # Estado do jogo
    is_for_trade: Optional[bool] = Field(False, description="Disponível para troca")
    is_for_sale: Optional[bool] = Field(False, description="Disponível para venda")
    condition: Optional[str] = Field(None, description="Estado de conservação")
    price: Optional[float] = Field(None, ge=0, description="Preço de venda")
    purchase_price: Optional[float] = Field(None, ge=0, description="Preço de compra (valor pago)")
    notes: Optional[str] = Field(None, description="Notas sobre o jogo")
    
    # Imagem
    image_url: Optional[str] = Field(None, description="URL da imagem do jogo")


class GameCreate(GameBase):
    """Schema para criar um jogo"""
    pass


class GameUpdate(BaseModel):
    """Schema para atualizar um jogo"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    year_published: Optional[int] = Field(None, ge=0, le=2100)
    game_type: Optional[GameType] = None
    base_game_id: Optional[int] = None
    order: Optional[int] = None
    min_players: Optional[int] = Field(None, ge=1)
    max_players: Optional[int] = Field(None, ge=1)
    min_playtime: Optional[int] = Field(None, ge=1)
    max_playtime: Optional[int] = Field(None, ge=1)
    min_age: Optional[int] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0, le=10)
    weight: Optional[float] = Field(None, ge=0, le=5)
    ranking_position: Optional[int] = Field(None, ge=1)
    is_for_trade: Optional[bool] = None
    is_for_sale: Optional[bool] = None
    condition: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    purchase_price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    image_url: Optional[str] = None


class GameResponse(GameBase):
    """Schema de resposta para jogo"""
    id: int
    user_id: int
    base_game_name: Optional[str] = Field(None, description="Nome do jogo base se for expansão")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserCollectionResponse(BaseModel):
    """Schema de resposta para a coleção completa do usuário"""
    user_id: int
    total_games: int
    games: list[GameResponse]
    
    class Config:
        from_attributes = True

