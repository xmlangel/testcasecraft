"""API v1 routes"""
from fastapi import APIRouter
from . import documents, search, embeddings, conversations

api_router = APIRouter()

# Include routers
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
