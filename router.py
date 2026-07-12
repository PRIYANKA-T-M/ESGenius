
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from . import schemas, service, score

# For the AI service, we'll import it when we create it in Step 5.
try:
    from . import ai
except ImportError:
    ai = None

# Fallback dependency to allow the module to be standalone for testing.
try:
    from backend.database import get_db  # type: ignore
except ImportError:
    def get_db():
        yield None

router = APIRouter()

# --- Policies ---
@router.post("/policies", response_model=schemas.PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(policy: schemas.PolicyCreate, db: Session = Depends(get_db)):
    return service.create_policy(db=db, policy=policy)

@router.get("/policies", response_model=List[schemas.PolicyResponse])
async def read_policies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.get_policies(db, skip=skip, limit=limit)

@router.get("/policies/{policy_id}", response_model=schemas.PolicyResponse)
async def read_policy(policy_id: int, db: Session = Depends(get_db)):
    db_policy = service.get_policy(db, policy_id=policy_id)
    if db_policy is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    return db_policy

# --- Compliance Issues ---
@router.post("/issues", response_model=schemas.ComplianceIssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(issue: schemas.ComplianceIssueCreate, db: Session = Depends(get_db)):
    return service.create_issue(db=db, issue=issue)

@router.get("/issues", response_model=List[schemas.ComplianceIssueResponse])
async def read_issues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Overdue detection happens automatically inside service.get_issues
    return service.get_issues(db, skip=skip, limit=limit)

@router.put("/issues/{issue_id}", response_model=schemas.ComplianceIssueResponse)
async def update_issue(issue_id: int, issue: schemas.ComplianceIssueUpdate, db: Session = Depends(get_db)):
    db_issue = service.update_issue(db, issue_id=issue_id, issue_update=issue)
    if db_issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return db_issue

# --- Governance Score ---
@router.get("/score")
async def get_score(department_id: int = 1, db: Session = Depends(get_db)):
    return score.calculate_department_score(db, department_id)

# --- AI Endpoints ---
@router.post("/ai/summarize-policy")
async def summarize_policy(file: UploadFile = File(...)):
    if ai is None:
        raise HTTPException(status_code=501, detail="AI service not implemented")
    return await ai.summarize_policy(file)

class ComplianceEmailRequest(BaseModel):
    issue_id: int

@router.post("/ai/compliance-email")
async def draft_compliance_email(request: ComplianceEmailRequest, db: Session = Depends(get_db)):
    if ai is None:
        raise HTTPException(status_code=501, detail="AI service not implemented")
    issue = service.get_issue(db, request.issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return await ai.draft_compliance_email(issue)
