import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# 1. Load the Gemini API Key from your .env
load_dotenv("backend/modules/governance/.env")

# 2. Import modules
from backend.modules.governance.models import Base as GovBase
from backend.modules.environmental.models import Base as EnvBase
from backend.modules.social.models import Base as SocBase

from backend.modules.governance.router import router as gov_router
from backend.modules.environmental.router import router as env_router
from backend.modules.social.router import router as soc_router

# 3. Setup a temporary SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_governance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
GovBase.metadata.create_all(bind=engine)
EnvBase.metadata.create_all(bind=engine)
SocBase.metadata.create_all(bind=engine)

# 4. Create the FastAPI app
app = FastAPI(title="ESGenius API (Local Test)")

# Allow frontend to talk to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Provide a real database session
def get_db_override():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the override to all endpoints
from backend.modules.governance.router import get_db as gov_get_db
from backend.modules.environmental.router import get_db as env_get_db
from backend.modules.social.router import get_db as soc_get_db

app.dependency_overrides[gov_get_db] = get_db_override
app.dependency_overrides[env_get_db] = get_db_override
app.dependency_overrides[soc_get_db] = get_db_override

# 6. Mount routers
app.include_router(gov_router, prefix="/api/governance")
app.include_router(env_router, prefix="/api/environment")
app.include_router(soc_router, prefix="/api/social")

if __name__ == "__main__":
    print("🚀 Booting up ESGenius Module APIs...")
    print("👉 Go to: http://localhost:8000/docs to test all APIs")
    uvicorn.run("run_backend:app", host="127.0.0.1", port=8000, reload=True)
