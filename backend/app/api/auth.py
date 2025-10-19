from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app import schemas, models, utils
from app.config import settings

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Registra um novo usuário"""
    
    # Verifica se username já existe
    db_user = utils.get_user_by_username(db, username=user_data.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Verifica se email já existe
    db_user = utils.get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Cria novo usuário
    hashed_password = utils.get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        cep=user_data.cep,
        role=user_data.role or models.UserRole.FREE
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Faz login e retorna token de acesso"""
    
    user = utils.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Atualiza último login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Cria token de acesso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: models.User = Depends(utils.get_current_active_user)
):
    """Retorna informações do usuário atual"""
    return current_user


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Retorna informações de um usuário"""
    user = utils.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/google/login")
async def google_login():
    """Inicia o fluxo de login com Google"""
    from google_auth_oauthlib.flow import Flow
    from app.config import settings
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            }
        },
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
    )
    
    return {"authorization_url": authorization_url}


@router.get("/google/callback")
async def google_callback(
    code: str,
    db: Session = Depends(get_db)
):
    """Callback do Google OAuth"""
    from google_auth_oauthlib.flow import Flow
    from google.oauth2 import id_token
    from google.auth.transport import requests
    from app.config import settings
    from fastapi.responses import RedirectResponse
    
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                }
            },
            scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        idinfo = id_token.verify_oauth2_token(
            credentials.id_token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Verifica se usuário já existe
        user = utils.get_user_by_email(db, email=email)
        
        if not user:
            # Novo usuário - redireciona para registro com dados do Google
            import urllib.parse
            google_data = {
                "email": email,
                "full_name": name,
                "picture_url": picture,
                "google_id": google_id,
            }
            encoded_data = urllib.parse.urlencode(google_data)
            frontend_url = f"http://localhost:3000/register?google={encoded_data}"
            return RedirectResponse(url=frontend_url)
        else:
            # Usuário já existe - vincula o Google ID e faz login
            user.google_id = google_id
            user.picture_url = picture
            if not user.full_name and name:
                user.full_name = name
            user.is_verified = True
            db.commit()
            
            # Atualiza último login
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.commit()
            
            # Cria token de acesso
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = utils.create_access_token(
                data={"sub": user.username},
                expires_delta=access_token_expires
            )
            
            # Redireciona para o frontend com o token
            frontend_url = "http://localhost:3000/auth/google/callback"
            return RedirectResponse(url=f"{frontend_url}?token={access_token}")
        
    except Exception as e:
        # Em caso de erro, redireciona para login com mensagem de erro
        frontend_url = "http://localhost:3000/login"
        return RedirectResponse(url=f"{frontend_url}?error=google_auth_failed")

