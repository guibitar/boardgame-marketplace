from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import User
from app.utils.auth import get_current_active_user
from app.services import ludopedia_service
from app.config import settings

router = APIRouter()


class LudopediaTokenRequest(BaseModel):
    code: str


class LudopediaTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.get("/authorize")
def ludopedia_authorize():
    """
    Gera a URL de autorização OAuth da Ludopedia
    Redireciona o usuário para a página de autorização
    """
    if not settings.LUDOPEDIA_APP_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Ludopedia OAuth não configurado. Configure LUDOPEDIA_APP_ID e LUDOPEDIA_APP_KEY"
        )
    
    authorize_url = (
        f"{ludopedia_service.OAUTH_URL}"
        f"?app_id={settings.LUDOPEDIA_APP_ID}"
        f"&redirect_uri={settings.LUDOPEDIA_REDIRECT_URI}"
    )
    
    return {
        "authorize_url": authorize_url,
        "message": "Acesse a URL de autorização para conectar sua conta da Ludopedia"
    }


@router.post("/callback")
async def ludopedia_callback(
    request: LudopediaTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Callback OAuth da Ludopedia
    Troca o código de autorização por um access_token
    """
    if not settings.LUDOPEDIA_APP_ID or not settings.LUDOPEDIA_APP_KEY:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Ludopedia OAuth não configurado"
        )
    
    try:
        # Trocar code por access_token
        url = ludopedia_service.TOKEN_URL
        data = {
            "code": request.code,
            "app_id": settings.LUDOPEDIA_APP_ID,
            "app_key": settings.LUDOPEDIA_APP_KEY
        }
        
        response = await ludopedia_service.client.post(url, json=data)
        response.raise_for_status()
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível obter o access_token"
            )
        
        # Salvar o access_token do usuário no banco de dados
        current_user.ludopedia_access_token = access_token
        db.commit()
        db.refresh(current_user)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Conta da Ludopedia conectada com sucesso!"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao conectar com a Ludopedia: {str(e)}"
        )


@router.post("/import-collection")
async def import_collection_from_ludopedia(
    access_token: str = Query(..., description="Access token da Ludopedia"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Importa a coleção completa do usuário da Ludopedia
    """
    try:
        # Buscar coleção da Ludopedia
        print(f"DEBUG - Buscando coleção com access_token: {access_token[:20]}...")
        games_data = await ludopedia_service.get_user_collection(access_token)
        print(f"DEBUG - Jogos retornados: {len(games_data)}")
        
        if not games_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coleção vazia ou não encontrada na Ludopedia"
            )
        
        from app.models import Game
        
        imported_games = []
        
        for game_data in games_data:
            # Valida se o jogo tem nome
            name = game_data.get("name")
            if not name or name.strip() == "":
                continue
            
            # Verifica se já existe na coleção
            existing = db.query(Game).filter(
                Game.user_id == current_user.id,
                Game.ludopedia_id == game_data.get("ludopedia_id")
            ).first()
            
            if existing:
                continue
            
            # Cria o jogo na coleção
            new_game = Game(
                user_id=current_user.id,
                name=name,
                description=game_data.get("description"),
                year_published=game_data.get("year_published"),
                game_type=game_data.get("game_type", "BASE"),
                ludopedia_id=game_data.get("ludopedia_id"),
                min_players=game_data.get("min_players"),
                max_players=game_data.get("max_players"),
                min_playtime=game_data.get("min_playtime"),
                max_playtime=game_data.get("max_playtime"),
                min_age=game_data.get("min_age"),
                rating=game_data.get("rating"),
                weight=game_data.get("weight"),
                ranking_position=game_data.get("ranking_position"),
                purchase_price=game_data.get("purchase_price"),
                image_url=game_data.get("image_url"),
                is_for_trade=False,
                is_for_sale=False
            )
            
            db.add(new_game)
            imported_games.append(new_game)
        
        print(f"DEBUG - Total de jogos para importar: {len(imported_games)}")
        db.commit()
        
        # Refresh dos jogos importados
        for game in imported_games:
            db.refresh(game)
        
        print(f"DEBUG - Importação concluída: {len(imported_games)} jogos importados")
        return {
            "message": f"Coleção importada com sucesso! {len(imported_games)} jogos adicionados.",
            "imported_count": len(imported_games),
            "total_found": len(games_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar coleção: {str(e)}"
        )


@router.post("/sync-collection")
async def sync_collection_from_ludopedia(
    access_token: Optional[str] = Query(None, description="Access token da Ludopedia (opcional se já autorizou antes)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Sincroniza a coleção do usuário com a Ludopedia:
    - Adiciona jogos novos
    - Atualiza jogos existentes
    - Remove jogos que não estão mais na Ludopedia
    """
    try:
        # Usar token salvo se não fornecido
        if not access_token:
            access_token = current_user.ludopedia_access_token
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de acesso da Ludopedia não encontrado. Por favor, autorize sua conta primeiro."
            )
        
        # Buscar coleção da Ludopedia
        print(f"DEBUG SYNC - Buscando coleção da Ludopedia...")
        ludopedia_games_data = await ludopedia_service.get_user_collection(access_token)
        print(f"DEBUG SYNC - Jogos na Ludopedia: {len(ludopedia_games_data)}")
        
        if not ludopedia_games_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coleção vazia ou não encontrada na Ludopedia"
            )
        
        from app.models import Game
        from typing import Dict, Any
        
        # Criar dicionário de jogos da Ludopedia por ludopedia_id
        ludopedia_games_dict: Dict[int, Dict[str, Any]] = {}
        for game_data in ludopedia_games_data:
            ludopedia_id = game_data.get("ludopedia_id")
            if ludopedia_id:
                ludopedia_games_dict[ludopedia_id] = game_data
        
        # Buscar jogos locais
        local_games = db.query(Game).filter(
            Game.user_id == current_user.id
        ).all()
        
        ludopedia_ids = set(ludopedia_games_dict.keys())
        local_ludopedia_ids = {game.ludopedia_id for game in local_games if game.ludopedia_id}
        
        # Calcular estatísticas
        to_add = ludopedia_ids - local_ludopedia_ids
        to_update = ludopedia_ids & local_ludopedia_ids
        to_remove = local_ludopedia_ids - ludopedia_ids
        
        added_count = 0
        updated_count = 0
        removed_count = 0
        
        # Adicionar jogos novos
        for ludopedia_id in to_add:
            game_data = ludopedia_games_dict[ludopedia_id]
            name = game_data.get("name")
            if not name or name.strip() == "":
                continue
            
            # Usar apenas dados básicos da coleção para evitar rate limiting
            # Detalhes podem ser buscados posteriormente se necessário
            
            new_game = Game(
                user_id=current_user.id,
                name=name,
                description=game_data.get("description"),
                year_published=game_data.get("year_published"),
                game_type=game_data.get("game_type", "BASE"),
                base_game_id=game_data.get("base_game_id"),
                ludopedia_id=ludopedia_id,
                order=game_data.get("order"),
                min_players=game_data.get("min_players"),
                max_players=game_data.get("max_players"),
                min_playtime=game_data.get("min_playtime"),
                max_playtime=game_data.get("max_playtime"),
                min_age=game_data.get("min_age"),
                rating=game_data.get("rating"),
                weight=game_data.get("weight"),
                ranking_position=game_data.get("ranking_position"),
                purchase_price=game_data.get("purchase_price"),
                image_url=game_data.get("image_url"),
                is_for_trade=False,
                is_for_sale=False
            )
            db.add(new_game)
            added_count += 1
        
        # Atualizar jogos existentes
        for ludopedia_id in to_update:
            game_data = ludopedia_games_dict[ludopedia_id]
            
            # Usar apenas dados básicos da coleção para evitar rate limiting
            existing_game = db.query(Game).filter(
                Game.user_id == current_user.id,
                Game.ludopedia_id == ludopedia_id
            ).first()
            
            if existing_game:
                # Atualizar campos (exceto is_for_trade, is_for_sale, price, condition, notes)
                existing_game.name = game_data.get("name")
                existing_game.description = game_data.get("description")
                existing_game.year_published = game_data.get("year_published")
                existing_game.game_type = game_data.get("game_type", "BASE")
                existing_game.base_game_id = game_data.get("base_game_id")
                existing_game.order = game_data.get("order")
                existing_game.min_players = game_data.get("min_players")
                existing_game.max_players = game_data.get("max_players")
                existing_game.min_playtime = game_data.get("min_playtime")
                existing_game.max_playtime = game_data.get("max_playtime")
                existing_game.min_age = game_data.get("min_age")
                existing_game.rating = game_data.get("rating")
                existing_game.weight = game_data.get("weight")
                existing_game.rank = game_data.get("rank")
                existing_game.purchase_price = game_data.get("purchase_price")
                existing_game.image_url = game_data.get("image_url")
                updated_count += 1
        
        # Remover jogos que não estão mais na Ludopedia
        for ludopedia_id in to_remove:
            game_to_remove = db.query(Game).filter(
                Game.user_id == current_user.id,
                Game.ludopedia_id == ludopedia_id
            ).first()
            if game_to_remove:
                db.delete(game_to_remove)
                removed_count += 1
        
        db.commit()
        
        print(f"DEBUG SYNC - Concluído: +{added_count}, ~{updated_count}, -{removed_count}")
        return {
            "message": f"Sincronização concluída! +{added_count} adicionados, ~{updated_count} atualizados, -{removed_count} removidos.",
            "added": added_count,
            "updated": updated_count,
            "removed": removed_count,
            "total_ludopedia": len(ludopedia_games_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao sincronizar coleção da Ludopedia: {str(e)}"
        )

