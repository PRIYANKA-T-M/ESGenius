from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
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

@router.get("/activities", response_model=List[schemas.CSRActivity])
def read_activities(db: Session = Depends(get_db)):
    return crud.get_activities(db)

@router.get("/challenges", response_model=List[schemas.Challenge])
def read_challenges(db: Session = Depends(get_db)):
    return crud.get_challenges(db)

@router.get("/leaderboard")
def read_leaderboard(db: Session = Depends(get_db)):
    return crud.get_leaderboard(db)

@router.post("/proof", response_model=schemas.Participation)
async def upload_proof(
    employee_id: int = Form(...),
    activity_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await file.read()
    
    # AI Vision Verification
    ai_result_dict = ai.verify_csr_proof(content, file.filename)
    ai_result = schemas.AIVerificationResult(**ai_result_dict)
    
    if not ai_result.approved:
        raise HTTPException(status_code=400, detail=ai_result.reason)
        
    return crud.create_participation(db, employee_id, activity_id, file.filename, ai_result)

@router.get("/score")
def get_social_score(employee_id: int = 1, db: Session = Depends(get_db)):
    return crud.get_score(db, employee_id)
