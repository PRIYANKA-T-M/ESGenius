from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from . import models, schemas

def get_policy(db: Session, policy_id: int):
    return db.query(models.Policy).filter(models.Policy.id == policy_id).first()

def get_policies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Policy).offset(skip).limit(limit).all()

def create_policy(db: Session, policy: schemas.PolicyCreate, file_path: Optional[str] = None):
    db_policy = models.Policy(
        title=policy.title,
        description=policy.description,
        version=policy.version,
        file_path=file_path
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def get_issue(db: Session, issue_id: int):
    return db.query(models.ComplianceIssue).filter(models.ComplianceIssue.id == issue_id).first()

def get_issues(db: Session, skip: int = 0, limit: int = 100):
    # Auto-detect overdue issues whenever we fetch issues
    detect_and_update_overdue_issues(db)
    return db.query(models.ComplianceIssue).offset(skip).limit(limit).all()

def create_issue(db: Session, issue: schemas.ComplianceIssueCreate):
    db_issue = models.ComplianceIssue(**issue.model_dump())
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

def update_issue(db: Session, issue_id: int, issue_update: schemas.ComplianceIssueUpdate):
    db_issue = get_issue(db, issue_id)
    if not db_issue:
        return None
    
    update_data = issue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_issue, key, value)
        
    db.commit()
    db.refresh(db_issue)
    return db_issue

def detect_and_update_overdue_issues(db: Session) -> int:
    """
    Scans for OPEN issues where due_date < today and marks them as OVERDUE.
    Returns the number of updated issues.
    """
    today = date.today()
    overdue_issues = db.query(models.ComplianceIssue).filter(
        models.ComplianceIssue.status == models.ComplianceStatus.OPEN,
        models.ComplianceIssue.due_date < today
    ).all()
    
    count = 0
    for issue in overdue_issues:
        issue.status = models.ComplianceStatus.OVERDUE
        count += 1
        
    if count > 0:
        db.commit()
        
    return count
