from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import schemas, crud, ai

# Fallback dependency to allow standalone testing
try:
    from backend.database import get_db  # type: ignore
except ImportError:
    def get_db():
        yield None

router = APIRouter()

@router.get("/transactions", response_model=List[schemas.CarbonTransaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transactions(db, skip=skip, limit=limit)

@router.post("/transactions", response_model=schemas.CarbonTransaction)
def create_transaction(transaction: schemas.CarbonTransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db, transaction)

@router.post("/import", response_model=schemas.CarbonTransaction)
async def import_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    
    # 1. AI Extracts data from invoice
    extracted_data = ai.extract_invoice_data(content, file.filename)
    
    if not extracted_data:
        raise HTTPException(status_code=400, detail="Could not extract data from invoice")
        
    # 2. Save transaction to DB
    transaction = schemas.CarbonTransactionCreate(
        department_id=extracted_data.get("department_id", 1),
        activity_type=extracted_data.get("activity_type", "Unknown"),
        quantity=extracted_data.get("quantity", 0.0),
        source_document=file.filename
    )
    
    return crud.create_transaction(db, transaction)

@router.get("/score")
def get_department_score(department_id: int = 1, db: Session = Depends(get_db)):
    return crud.get_score(db, department_id)

@router.get("/dashboard", response_model=schemas.DashboardData)
def get_dashboard_stats(db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db)
    total = sum([t.carbon_emission for t in transactions])
    
    # Mocking monthly calculations for speed
    monthly = total * 0.2 if total > 0 else 0
    score_data = crud.get_score(db, department_id=1)
    
    return schemas.DashboardData(
        total_emissions=total,
        monthly_emissions=monthly,
        department_score=score_data["score"],
        goals_achieved=1 # Mocked
    )
