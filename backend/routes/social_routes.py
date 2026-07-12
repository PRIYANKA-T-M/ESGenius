import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from database import get_db
import crud.social as crud
import schemas.social as schemas
from services.gemini_service import verify_proof_with_gemini

router = APIRouter(prefix="/social", tags=["Social & Gamification"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_employee_id(
    x_employee_id: Optional[int] = Header(None, alias="X-Employee-ID"),
    employee_id: Optional[int] = None
) -> int:
    """
    Helper dependency to extract the employee context. Reads from the header
    'X-Employee-ID' or parameter 'employee_id'. Defaults to 1 for ease of hackathon demo.
    """
    if x_employee_id is not None:
        return x_employee_id
    if employee_id is not None:
        return employee_id
    return 1

@router.get("/challenges", response_model=List[schemas.ChallengeResponse])
def read_challenges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves all available CSR challenges.
    """
    return crud.get_challenges(db, skip=skip, limit=limit)

@router.post("/challenges", response_model=schemas.ChallengeResponse)
def create_challenge(challenge: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    """
    Creates a new CSR challenge in the system.
    """
    return crud.create_challenge(db, challenge=challenge)

@router.post("/upload-proof", response_model=schemas.EmployeeParticipationResponse)
def upload_proof(
    csr_activity_id: int = Form(...),
    file: UploadFile = File(...),
    employee_id: int = Depends(get_current_employee_id),
    db: Session = Depends(get_db)
):
    """
    Uploads a photo proving participation in a CSR activity. Saves the image
    locally to the uploads folder, and records a 'Pending' participation entry.
    """
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    activity = crud.get_csr_activity(db, csr_activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="CSR Activity not found")
        
    # Double check extension validation
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP."
        )
        
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file with uniform structured filename
    safe_filename = f"emp_{employee_id}_act_{csr_activity_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save proof image: {str(e)}")
        
    participation_in = schemas.EmployeeParticipationCreate(
        employee_id=employee_id,
        csr_activity_id=csr_activity_id
    )
    
    # Check if a participation record already exists to overwrite
    participations = crud.get_participations_by_employee(db, employee_id)
    existing = next((p for p in participations if p.csr_activity_id == csr_activity_id), None)
    
    if existing:
        db_part = crud.update_participation_proof(db, existing.id, f"/uploads/{safe_filename}")
        db_part = crud.update_participation_status(db, db_part.id, "Pending")
    else:
        db_part = crud.create_participation(db, participation_in)
        db_part = crud.update_participation_proof(db, db_part.id, f"/uploads/{safe_filename}")
        
    return db_part

@router.post("/verify-image")
def verify_image(
    participation_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Evaluates the uploaded proof image for a participation record using Gemini Vision.
    If Gemini approves, updates status to 'Approved', awards XP to the employee, 
    evaluates badge unlocks, and auto-completes overlapping joined challenges.
    """
    participation = crud.get_participation(db, participation_id)
    if not participation:
        raise HTTPException(status_code=404, detail="Participation record not found.")
        
    if not participation.proof_image_url:
        raise HTTPException(status_code=400, detail="No proof image uploaded yet.")
        
    # Convert request URL path to absolute local path
    image_rel_path = participation.proof_image_url.lstrip("/")
    image_path = os.path.join(os.getcwd(), image_rel_path)
    
    activity = crud.get_csr_activity(db, participation.csr_activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Associated CSR activity not found.")
        
    # Verify with Gemini Vision
    verification_result = verify_proof_with_gemini(image_path, activity.description)
    
    if verification_result.get("approved"):
        # 1. Update status
        crud.update_participation_status(db, participation_id, "Approved")
        
        # 2. Award activity XP
        employee = crud.update_employee_xp(db, participation.employee_id, activity.xp_reward)
        
        # 3. Assess badges
        all_badges = crud.get_badges(db)
        unlocked_badge_ids = {eb.badge_id for eb in crud.get_employee_badges(db, employee.id)}
        
        newly_unlocked_badges = []
        for badge in all_badges:
            if badge.id not in unlocked_badge_ids and employee.xp >= badge.xp_required:
                crud.unlock_badge_for_employee(db, employee.id, badge.id)
                newly_unlocked_badges.append(badge.name)
                
        # 4. Check matching challenges to auto-complete
        joined_challenges = crud.get_challenge_participations_by_employee(db, employee.id)
        for jc in joined_challenges:
            if jc.status == "Joined":
                challenge = crud.get_challenge(db, jc.challenge_id)
                if challenge and (activity.title.lower() in challenge.title.lower() or challenge.title.lower() in activity.title.lower()):
                    # Complete challenge
                    crud.update_challenge_participation_status(db, employee.id, challenge.id, "Completed")
                    # Award challenge XP
                    employee = crud.update_employee_xp(db, employee.id, challenge.xp_reward)
                    # Unlock challenge badge if specified
                    if challenge.badge_id and challenge.badge_id not in unlocked_badge_ids:
                        crud.unlock_badge_for_employee(db, employee.id, challenge.badge_id)
                        challenge_badge = crud.get_badge(db, challenge.badge_id)
                        if challenge_badge:
                            newly_unlocked_badges.append(challenge_badge.name)
                            
        return {
            "approved": True,
            "status": "Approved",
            "message": f"Gemini approved proof. Awarded {activity.xp_reward} XP.",
            "new_xp": employee.xp,
            "gemini_reason": verification_result.get("reason"),
            "unlocked_badges": newly_unlocked_badges
        }
    else:
        crud.update_participation_status(db, participation_id, "Rejected")
        return {
            "approved": False,
            "status": "Rejected",
            "message": "Gemini verification rejected the uploaded proof.",
            "gemini_reason": verification_result.get("reason")
        }

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
def read_leaderboard(db: Session = Depends(get_db)):
    """
    Retrieves the gamified leaderboards sorted by total XP.
    """
    return crud.get_leaderboard(db)

@router.get("/badges", response_model=List[schemas.BadgeResponse])
def read_badges(db: Session = Depends(get_db)):
    """
    Retrieves all pre-configured achievement badges.
    """
    return crud.get_badges(db)

@router.post("/join-challenge")
def join_challenge(
    challenge_id: int = Form(...),
    employee_id: int = Depends(get_current_employee_id),
    db: Session = Depends(get_db)
):
    """
    Registers an employee's enrollment in a CSR challenge.
    """
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    challenge = crud.get_challenge(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    participation_in = schemas.ChallengeParticipationCreate(
        employee_id=employee_id,
        challenge_id=challenge_id
    )
    return crud.create_challenge_participation(db, participation_in)

@router.get("/my-profile")
def get_my_profile(
    employee_id: int = Depends(get_current_employee_id),
    db: Session = Depends(get_db)
):
    """
    Helper utility API fetching full context for the logged-in employee,
    including participations, challenge statuses, and unlocked badges.
    """
    employee = crud.get_employee(db, employee_id)
    if not employee:
        # Bootstrap default employee if none exists
        employee_in = schemas.EmployeeCreate(
            name="Jane Doe", 
            email="jane.doe@ecosphere.com"
        )
        employee = crud.create_employee(db, employee_in)
        employee_id = employee.id
        
    participations = crud.get_participations_by_employee(db, employee_id)
    challenge_participations = crud.get_challenge_participations_by_employee(db, employee_id)
    unlocked_badges = crud.get_employee_badges(db, employee_id)
    
    return {
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "xp": employee.xp,
            "created_at": employee.created_at
        },
        "participations": [
            {
                "id": p.id,
                "csr_activity_id": p.csr_activity_id,
                "proof_image_url": p.proof_image_url,
                "approval_status": p.approval_status,
                "created_at": p.created_at
            } for p in participations
        ],
        "challenges": [
            {
                "id": cp.id,
                "challenge_id": cp.challenge_id,
                "status": cp.status,
                "created_at": cp.created_at
            } for cp in challenge_participations
        ],
        "badges": [
            {
                "id": ub.badge.id,
                "name": ub.badge.name,
                "description": ub.badge.description,
                "icon_url": ub.badge.icon_url,
                "xp_required": ub.badge.xp_required,
                "unlocked_at": ub.unlocked_at
            } for ub in unlocked_badges
        ]
    }
