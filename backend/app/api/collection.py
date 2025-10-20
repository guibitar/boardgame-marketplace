from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import Game, User
from app.schemas import (
    GameCreate, 
    GameUpdate, 
    GameResponse, 
    UserCollectionResponse
)
from app.utils.auth import get_current_active_user
from app.services import ludopedia_service, bgg_service

router = APIRouter()


@router.get("/", response_model=UserCollectionResponse)
def get_collection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    sort_by: str = Query("order", alias="sortBy", description="Campo para ordenação (order, name, year_published, purchase_price, rating, weight, ranking_position)"),
    sort_order: str = Query("asc", alias="sortOrder", description="Ordem de classificação (asc, desc)")
):
    """Retorna a coleção completa do usuário"""
    from sqlalchemy.orm import joinedload
    from sqlalchemy import desc, asc
    
    # Log para debug
    print(f"DEBUG COLLECTION - Parâmetros recebidos: sort_by={sort_by}, sort_order={sort_order}")
    
    # Validar campo de ordenação
    valid_sort_fields = ["order", "name", "year_published", "purchase_price", "rating", "weight", "ranking_position", "created_at"]
    if sort_by not in valid_sort_fields:
        print(f"DEBUG COLLECTION - Campo inválido, usando 'order'")
        sort_by = "order"
    
    # Determinar ordem
    order_func = desc if sort_order == "desc" else asc
    
    # Buscar jogos com ordenação
    # NULLS LAST para que valores NULL fiquem no final
    from sqlalchemy import nullslast, nullsfirst
    
    if sort_order == "desc":
        order_clause = nullsfirst(order_func(getattr(Game, sort_by)))
    else:
        order_clause = nullslast(order_func(getattr(Game, sort_by)))
    
    games = db.query(Game).options(
        joinedload(Game.base_game)
    ).filter(Game.user_id == current_user.id).order_by(order_clause).all()
    
    # Log para debug
    print(f"DEBUG COLLECTION - Ordenação: {sort_by} {sort_order}")
    print(f"DEBUG COLLECTION - Total de jogos: {len(games)}")
    if games:
        print(f"DEBUG COLLECTION - Primeiros 3 jogos: {[{'id': g.id, 'name': g.name, 'order': g.order, 'year': g.year_published} for g in games[:3]]}")
    
    # Criar lista de jogos com nome do jogo base
    games_with_base = []
    for game in games:
        game_dict = {
            **{c.name: getattr(game, c.name) for c in game.__table__.columns},
            'base_game_name': game.base_game.name if game.base_game else None
        }
        games_with_base.append(game_dict)
    
    print(f"DEBUG COLLECTION - Retornando {len(games_with_base)} jogos")
    
    return UserCollectionResponse(
        user_id=current_user.id,
        total_games=len(games),
        games=games_with_base
    )


@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
def add_game_to_collection(
    game_data: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Adiciona um jogo à coleção do usuário"""
    # Verifica se já existe um jogo com o mesmo ludopedia_id ou bgg_id
    if game_data.ludopedia_id:
        existing = db.query(Game).filter(
            Game.user_id == current_user.id,
            Game.ludopedia_id == game_data.ludopedia_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este jogo já está na sua coleção"
            )
    
    if game_data.bgg_id:
        existing = db.query(Game).filter(
            Game.user_id == current_user.id,
            Game.bgg_id == game_data.bgg_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este jogo já está na sua coleção"
            )
    
    # Cria o novo jogo
    new_game = Game(
        user_id=current_user.id,
        **game_data.model_dump()
    )
    
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    
    return new_game


@router.get("/games/{game_id}", response_model=GameResponse)
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Busca um jogo específico da coleção do usuário"""
    game = db.query(Game).filter(
        Game.id == game_id,
        Game.user_id == current_user.id
    ).first()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogo não encontrado na sua coleção"
        )
    
    return game


@router.put("/games/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int,
    game_data: GameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza um jogo da coleção"""
    # Busca o jogo
    game = db.query(Game).filter(
        Game.id == game_id,
        Game.user_id == current_user.id
    ).first()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogo não encontrado na sua coleção"
        )
    
    # Atualiza os campos fornecidos
    update_data = game_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(game, field, value)
    
    db.commit()
    db.refresh(game)
    
    return game


@router.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove um jogo da coleção"""
    # Busca o jogo
    game = db.query(Game).filter(
        Game.id == game_id,
        Game.user_id == current_user.id
    ).first()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogo não encontrado na sua coleção"
        )
    
    db.delete(game)
    db.commit()
    
    return None


@router.delete("/", status_code=status.HTTP_200_OK)
def clear_collection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove todos os jogos da coleção do usuário"""
    games = db.query(Game).filter(Game.user_id == current_user.id).all()
    count = len(games)
    
    for game in games:
        db.delete(game)
    
    db.commit()
    
    return {
        "message": f"Coleção limpa com sucesso! {count} jogos removidos.",
        "removed_count": count
    }


# Schemas para requisições
class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 20


class ImportGamesRequest(BaseModel):
    game_ids: List[int]


@router.get("/search/ludopedia")
async def search_ludopedia(
    query: str = Query(..., description="Nome do jogo para buscar"),
    limit: int = Query(20, ge=1, le=50, description="Número máximo de resultados")
):
    """Busca jogos na Ludopedia"""
    games = await ludopedia_service.search_games(query, limit)
    return {"games": games}


@router.get("/search/bgg")
async def search_bgg(
    query: str = Query(..., description="Nome do jogo para buscar"),
    limit: int = Query(20, ge=1, le=50, description="Número máximo de resultados")
):
    """Busca jogos no BoardGameGeek"""
    games = await bgg_service.search_games(query, limit)
    return {"games": games}


@router.get("/game-details/bgg/{bgg_id}")
async def get_bgg_game_details(bgg_id: int):
    """Busca detalhes de um jogo específico no BoardGameGeek"""
    game_details = await bgg_service.get_game_details(bgg_id)
    if not game_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jogo não encontrado no BoardGameGeek"
        )
    return game_details


@router.post("/import/bgg", response_model=List[GameResponse], status_code=status.HTTP_201_CREATED)
async def import_from_bgg(
    request: ImportGamesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Importa jogos do BoardGameGeek para a coleção do usuário"""
    imported_games = []
    
    for bgg_id in request.game_ids:
        # Busca detalhes do jogo no BGG
        game_details = await bgg_service.get_game_details(bgg_id)
        
        if not game_details:
            continue
        
        # Valida se o jogo tem nome
        name = game_details.get("name")
        if not name or name.strip() == "":
            continue
        
        # Verifica se já existe na coleção
        existing = db.query(Game).filter(
            Game.user_id == current_user.id,
            Game.bgg_id == bgg_id
        ).first()
        
        if existing:
            continue
        
        # Cria o jogo na coleção
        new_game = Game(
            user_id=current_user.id,
            name=name,
            description=game_details.get("description"),
            year_published=game_details.get("year_published"),
            game_type="BASE",  # Por padrão, todos os jogos importados são base
            bgg_id=bgg_id,
            min_players=game_details.get("min_players"),
            max_players=game_details.get("max_players"),
            min_playtime=game_details.get("min_playtime"),
            max_playtime=game_details.get("max_playtime"),
            min_age=game_details.get("min_age"),
            rating=game_details.get("rating"),
            weight=game_details.get("weight"),
            image_url=game_details.get("image_url"),
            is_for_trade=False,
            is_for_sale=False
        )
        
        db.add(new_game)
        imported_games.append(new_game)
    
    db.commit()
    
    # Refresh dos jogos importados
    for game in imported_games:
        db.refresh(game)
    
    return imported_games


@router.post("/import-collection/bgg", response_model=List[GameResponse], status_code=status.HTTP_201_CREATED)
async def import_collection_from_bgg(
    username: str = Query(..., description="Nome de usuário no BoardGameGeek"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Importa a coleção completa de um usuário do BoardGameGeek"""
    # Busca a coleção do usuário no BGG
    games_data = await bgg_service.get_user_collection(username)
    
    if not games_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuário '{username}' não encontrado no BoardGameGeek ou coleção vazia"
        )
    
    imported_games = []
    
    for game_data in games_data:
        # Valida se o jogo tem nome
        name = game_data.get("name")
        if not name or name.strip() == "":
            continue
        
        # Verifica se já existe na coleção
        existing = db.query(Game).filter(
            Game.user_id == current_user.id,
            Game.bgg_id == game_data["bgg_id"]
        ).first()
        
        if existing:
            continue
        
        # Cria o jogo na coleção
        new_game = Game(
            user_id=current_user.id,
            name=name,
            year_published=game_data.get("year_published"),
            game_type="BASE",  # Por padrão, todos os jogos importados são base
            bgg_id=game_data["bgg_id"],
            min_players=game_data.get("min_players"),
            max_players=game_data.get("max_players"),
            min_playtime=game_data.get("min_playtime"),
            max_playtime=game_data.get("max_playtime"),
            min_age=game_data.get("min_age"),
            rating=game_data.get("rating"),
            weight=game_data.get("weight"),
            is_for_trade=False,
            is_for_sale=False
        )
        
        db.add(new_game)
        imported_games.append(new_game)
    
    db.commit()
    
    # Refresh dos jogos importados
    for game in imported_games:
        db.refresh(game)
    
    return imported_games


@router.post("/import/ludopedia", response_model=List[GameResponse], status_code=status.HTTP_201_CREATED)
async def import_from_ludopedia(
    request: ImportGamesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Importa jogos da Ludopedia para a coleção do usuário.
    TODO: Implementar quando tiver acesso à API da Ludopedia
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Importação da Ludopedia ainda não implementada. Entre em contato com api@ludopedia.com.br para obter acesso à API."
    )


@router.post("/import-collection/ludopedia", response_model=List[GameResponse], status_code=status.HTTP_201_CREATED)
async def import_collection_from_ludopedia(
    username: str = Query(..., description="Nome de usuário na Ludopedia"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Importa a coleção completa de um usuário da Ludopedia.
    TODO: Implementar quando tiver acesso à API da Ludopedia
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Importação da Ludopedia ainda não implementada. Entre em contato com api@ludopedia.com.br para obter acesso à API."
    )

