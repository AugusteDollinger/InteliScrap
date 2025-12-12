from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import v1
from app.database import engine
from app.models.base import Base

# Create database tables (in production, use Alembic migrations instead)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InteliScrap API",
    description="API for InteliScrap application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(v1.router, prefix="/api/v1", tags=["API v1"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "InteliScrap API is running"}