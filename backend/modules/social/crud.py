from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
import datetime

def get_activities(db: Session):
    return db.query(models.CSRActivity).all()

def get_challenges(db: Session):
    return db.query(models.Challenge).all()

def get_leaderboard(db: Session):
    # Group by employee_id and sum points
    results = db.query(
        models.EmployeeParticipation.employee_id,
        func.sum(models.EmployeeParticipation.points).label('total_xp')
    ).filter(
        models.EmployeeParticipation.approval_status == 'APPROVED'
    ).group_by(
        models.EmployeeParticipation.employee_id
    ).order_by(
        func.sum(models.EmployeeParticipation.points).desc()
    ).limit(10).all()
    
    leaderboard = []
    for row in results:
        leaderboard.append({
            "employee_id": row.employee_id,
            "total_xp": row.total_xp,
            "name": f"Employee {row.employee_id}" # Mocking name mapping
        })
    return leaderboard

def create_participation(db: Session, employee_id: int, activity_id: int, proof_path: str, ai_result: schemas.AIVerificationResult):
    participation = models.EmployeeParticipation(
        employee_id=employee_id,
        activity_id=activity_id,
        proof_path=proof_path,
        approval_status="APPROVED" if ai_result.approved else "REJECTED",
        points=ai_result.xp if ai_result.approved else 0
    )
    db.add(participation)
    db.commit()
    db.refresh(participation)
    return participation

def get_score(db: Session, employee_id: int):
    # Calculate social score for a user or global
    total_xp = db.query(func.sum(models.EmployeeParticipation.points)).filter(
        models.EmployeeParticipation.employee_id == employee_id,
        models.EmployeeParticipation.approval_status == 'APPROVED'
    ).scalar() or 0
    
    score = min(100, int((total_xp / 1000) * 100)) # e.g. 1000 XP = 100 score
    return {"score": score}
