import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# 1. Load the Gemini API Key from your .env
load_dotenv("backend/modules/governance/.env")

# 2. Import your module
from backend.modules.governance.models import Base
from backend.modules.governance.router import router

# 3. Setup a temporary SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_governance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables (policies, compliance_issues)
Base.metadata.create_all(bind=engine)

# 4. Create the FastAPI app
app = FastAPI(title="ESGenius Governance API (Local Test)")

# Allow frontend to talk to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Provide a real database session (overriding the dummy one in router.py)
def get_db_override():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the override to all endpoints
from backend.modules.governance.router import get_db
app.dependency_overrides[get_db] = get_db_override

# 6. Mount your router
app.include_router(router, prefix="/api/governance")

if __name__ == "__main__":
    print("🚀 Booting up Governance Module API...")
    print("👉 Go to: http://localhost:8000/docs to test the API")
    uvicorn.run("run_backend:app", host="127.0.0.1", port=8000, reload=True)
