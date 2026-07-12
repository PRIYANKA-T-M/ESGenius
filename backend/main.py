from fastapi import FastAPI
from backend.database import engine
from backend.models.environmental import Base
from backend.routes.environmental_routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoSphere – ESG Management Platform",
    description="Environmental Module API",
    version="1.0.0",
)

app.include_router(router, prefix="/api/v1", tags=["Environmental"])
