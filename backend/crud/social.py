from sqlalchemy.orm import Session
from datetime import datetime
from models.social import (
    Employee, CSRActivity, EmployeeParticipation, 
    Challenge, ChallengeParticipation, Badge, EmployeeBadge
)
from schemas import social as schemas

# Employee CRUD
def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(Employee).filter(Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = Employee(name=employee.name, email=employee.email, xp=0)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee_xp(db: Session, employee_id: int, xp_to_add: int):
    db_employee = get_employee(db, employee_id)
    if db_employee:
        db_employee.xp += xp_to_add
        db.commit()
        db.refresh(db_employee)
    return db_employee

def get_leaderboard(db: Session):
    return db.query(Employee).order_by(Employee.xp.desc()).all()

# CSR Activity CRUD
def get_csr_activity(db: Session, activity_id: int):
    return db.query(CSRActivity).filter(CSRActivity.id == activity_id).first()

def get_csr_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CSRActivity).offset(skip).limit(limit).all()

def create_csr_activity(db: Session, activity: schemas.CSRActivityCreate):
    db_activity = CSRActivity(
        title=activity.title,
        description=activity.description,
        date=activity.date,
        xp_reward=activity.xp_reward
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def delete_csr_activity(db: Session, activity_id: int):
    db_activity = get_csr_activity(db, activity_id)
    if db_activity:
        db.delete(db_activity)
        db.commit()
        return True
    return False

# Employee Participation CRUD
def get_participation(db: Session, participation_id: int):
    return db.query(EmployeeParticipation).filter(EmployeeParticipation.id == participation_id).first()

def get_participations_by_employee(db: Session, employee_id: int):
    return db.query(EmployeeParticipation).filter(EmployeeParticipation.employee_id == employee_id).all()

def create_participation(db: Session, participation: schemas.EmployeeParticipationCreate):
    db_participation = EmployeeParticipation(
        employee_id=participation.employee_id,
        csr_activity_id=participation.csr_activity_id,
        approval_status="Pending"
    )
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    return db_participation

def update_participation_proof(db: Session, participation_id: int, proof_image_url: str):
    db_participation = get_participation(db, participation_id)
    if db_participation:
        db_participation.proof_image_url = proof_image_url
        db.commit()
        db.refresh(db_participation)
    return db_participation

def update_participation_status(db: Session, participation_id: int, status: str):
    db_participation = get_participation(db, participation_id)
    if db_participation:
        db_participation.approval_status = status
        db.commit()
        db.refresh(db_participation)
    return db_participation

# Challenge CRUD
def get_challenge(db: Session, challenge_id: int):
    return db.query(Challenge).filter(Challenge.id == challenge_id).first()

def get_challenges(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Challenge).offset(skip).limit(limit).all()

def create_challenge(db: Session, challenge: schemas.ChallengeCreate):
    db_challenge = Challenge(
        title=challenge.title,
        description=challenge.description,
        start_date=challenge.start_date,
        end_date=challenge.end_date,
        xp_reward=challenge.xp_reward,
        badge_id=challenge.badge_id
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

def delete_challenge(db: Session, challenge_id: int):
    db_challenge = get_challenge(db, challenge_id)
    if db_challenge:
        db.delete(db_challenge)
        db.commit()
        return True
    return False

# Challenge Participation CRUD
def get_challenge_participation(db: Session, employee_id: int, challenge_id: int):
    return db.query(ChallengeParticipation).filter(
        ChallengeParticipation.employee_id == employee_id,
        ChallengeParticipation.challenge_id == challenge_id
    ).first()

def get_challenge_participations_by_employee(db: Session, employee_id: int):
    return db.query(ChallengeParticipation).filter(ChallengeParticipation.employee_id == employee_id).all()

def create_challenge_participation(db: Session, participation: schemas.ChallengeParticipationCreate):
    existing = get_challenge_participation(db, participation.employee_id, participation.challenge_id)
    if existing:
        return existing
    db_part = ChallengeParticipation(
        employee_id=participation.employee_id,
        challenge_id=participation.challenge_id,
        status="Joined"
    )
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part

def update_challenge_participation_status(db: Session, employee_id: int, challenge_id: int, status: str):
    db_part = get_challenge_participation(db, employee_id, challenge_id)
    if db_part:
        db_part.status = status
        db.commit()
        db.refresh(db_part)
    return db_part

# Badge CRUD
def get_badge(db: Session, badge_id: int):
    return db.query(Badge).filter(Badge.id == badge_id).first()

def get_badges(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Badge).offset(skip).limit(limit).all()

def create_badge(db: Session, badge: schemas.BadgeCreate):
    existing = db.query(Badge).filter(Badge.name == badge.name).first()
    if existing:
        return existing
    db_badge = Badge(
        name=badge.name,
        description=badge.description,
        icon_url=badge.icon_url,
        xp_required=badge.xp_required
    )
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def get_employee_badges(db: Session, employee_id: int):
    return db.query(EmployeeBadge).filter(EmployeeBadge.employee_id == employee_id).all()

def unlock_badge_for_employee(db: Session, employee_id: int, badge_id: int):
    existing = db.query(EmployeeBadge).filter(
        EmployeeBadge.employee_id == employee_id,
        EmployeeBadge.badge_id == badge_id
    ).first()
    if existing:
        return existing
    db_emp_badge = EmployeeBadge(
        employee_id=employee_id,
        badge_id=badge_id,
        unlocked_at=datetime.utcnow()
    )
    db.add(db_emp_badge)
    db.commit()
    db.refresh(db_emp_badge)
    return db_emp_badge
