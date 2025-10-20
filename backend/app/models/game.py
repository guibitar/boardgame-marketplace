from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class GameType(str, enum.Enum):
    """Tipo de jogo"""
    BASE = "BASE"
    EXPANSION = "EXPANSION"


class Game(Base):
    """Modelo de jogo de tabuleiro"""
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Dados do jogo
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    year_published = Column(Integer, nullable=True)
    game_type = Column(Enum(GameType), default=GameType.BASE, nullable=False)
    base_game_id = Column(Integer, ForeignKey("games.id"), nullable=True)  # ID do jogo base se for expansão
    
    # Dados de importação
    ludopedia_id = Column(Integer, nullable=True, unique=True)
    bgg_id = Column(Integer, nullable=True, unique=True)
    order = Column(Integer, nullable=True)  # Ordem original da Ludopedia
    
    # Metadados
    min_players = Column(Integer, nullable=True)
    max_players = Column(Integer, nullable=True)
    min_playtime = Column(Integer, nullable=True)  # em minutos
    max_playtime = Column(Integer, nullable=True)
    min_age = Column(Integer, nullable=True)
    rating = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)  # Complexidade (BGG)
    ranking_position = Column(Integer, nullable=True)  # Posição no ranking
    
    # Estado do jogo na coleção
    is_for_trade = Column(Boolean, default=False, nullable=False)
    is_for_sale = Column(Boolean, default=False, nullable=False)
    condition = Column(String, nullable=True)  # new, like_new, good, fair
    price = Column(Float, nullable=True)  # Preço de venda
    purchase_price = Column(Float, nullable=True)  # Preço de compra (valor pago)
    notes = Column(Text, nullable=True)
    
    # Imagem
    image_url = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relacionamentos
    owner = relationship("User", back_populates="games")
    base_game = relationship("Game", remote_side=[id], backref="expansions")

