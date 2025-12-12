from fastapi import FastAPI
from app.api import v1

app = FastAPI()

# Include API routers
app.include_router(v1.router, prefix="/api/v1")