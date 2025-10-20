from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import models to register them with SQLAlchemy
from app.models import User, Game

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para gerenciar coleções de jogos de tabuleiro e criar listas de vendas",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "BoardGame Marketplace API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Import routers
from app.api import auth, collection, ludopedia_auth

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(collection.router, prefix="/api/collection", tags=["collection"])
app.include_router(ludopedia_auth.router, prefix="/api/ludopedia", tags=["ludopedia"])

# To be created:
# from app.api import users, sale_lists, orders
# app.include_router(users.router, prefix="/api/users", tags=["users"])
# app.include_router(sale_lists.router, prefix="/api/sale-lists", tags=["sale-lists"])
# app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

