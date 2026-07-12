import os
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
from routes.social_routes import router as social_router
from models.social import Employee, CSRActivity, Challenge, Badge, EmployeeBadge, ChallengeParticipation

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoSphere ESG Platform - Social & Gamification Backend",
    version="1.0.0",
    description="Backend API for EcoSphere Social Module: CSR tracking, gamification, and Gemini Vision auditing."
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount it as static files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Social routing module
app.include_router(social_router)

# Seed initial data for hackathon demo
def seed_data():
    db: Session = SessionLocal()
    try:
        # Check if seeding is already done
        if db.query(Employee).count() > 0:
            return
            
        print("Seeding initial ESG Social data...")
        
        # 1. Seed Employees
        employees = [
            Employee(name="Jane Doe", email="jane.doe@ecosphere.com", xp=120),
            Employee(name="John Smith", email="john.smith@ecosphere.com", xp=80),
            Employee(name="Alice Johnson", email="alice.johnson@ecosphere.com", xp=250),
            Employee(name="Bob Miller", email="bob.miller@ecosphere.com", xp=0)
        ]
        db.add_all(employees)
        db.commit() # Commit to get IDs
        
        # 2. Seed CSR Activities
        activities = [
            CSRActivity(
                title="Plant a Tree in the Office Garden",
                description="Plant a tree sapling in the office backyard garden. Upload a picture showing you watering the sapling or digging the soil to earn your reward.",
                date=datetime.utcnow(),
                xp_reward=50
            ),
            CSRActivity(
                title="Bring Your Reusable Coffee Mug",
                description="Capture a photo of your reusable coffee mug or water bottle at your workplace desk instead of utilizing disposable cups.",
                date=datetime.utcnow() - timedelta(days=1),
                xp_reward=20
            ),
            CSRActivity(
                title="Organize E-Waste Recycling",
                description="Bring obsolete keyboards, cables, or broken screens from home and drop them in the green office e-waste bin. Take a picture of the device in the bin.",
                date=datetime.utcnow() - timedelta(days=2),
                xp_reward=80
            ),
            CSRActivity(
                title="Carpool or Bike to Work",
                description="Take a selfie of you sharing a ride, carpooling, or biking to the office to reduce transport emissions.",
                date=datetime.utcnow() - timedelta(days=3),
                xp_reward=40
            )
        ]
        db.add_all(activities)
        
        # 3. Seed Badges
        badges = [
            Badge(name="Green Rookie", description="Start your eco-friendly office habits by reaching 20 XP.", icon_url="🌱", xp_required=20),
            Badge(name="Eco Enthusiast", description="Nurture sustainability ideas in the workplace by reaching 100 XP.", icon_url="🌿", xp_required=100),
            Badge(name="Sustain Leader", description="Become an ESG champion in the community by reaching 200 XP.", icon_url="👑", xp_required=200)
        ]
        db.add_all(badges)
        db.commit() # Commit to get IDs
        
        # 4. Seed Challenges
        challenges = [
            Challenge(
                title="Office Greening Initiative",
                description="Nurture nature. Plant a tree sapling in the office garden and upload photo proof.",
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=7),
                xp_reward=30,
                badge_id=badges[1].id # Eco Enthusiast badge
            ),
            Challenge(
                title="Zero-Waste Workspace",
                description="Use reusable mugs and recycle e-waste during the zero-waste month.",
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=30),
                xp_reward=50,
                badge_id=badges[2].id # Sustain Leader badge
            )
        ]
        db.add_all(challenges)
        db.commit()
        
        # 5. Unlock initial badges based on seeded XP
        for emp in employees:
            for badge in badges:
                if emp.xp >= badge.xp_required:
                    eb = EmployeeBadge(employee_id=emp.id, badge_id=badge.id, unlocked_at=datetime.utcnow())
                    db.add(eb)
                    
        # 6. Seed Challenge Participations
        # John and Jane joined Office Greening
        cp1 = ChallengeParticipation(employee_id=employees[0].id, challenge_id=challenges[0].id, status="Joined")
        cp2 = ChallengeParticipation(employee_id=employees[1].id, challenge_id=challenges[0].id, status="Joined")
        # Alice completed Office Greening
        cp3 = ChallengeParticipation(employee_id=employees[2].id, challenge_id=challenges[0].id, status="Completed")
        db.add_all([cp1, cp2, cp3])
        
        db.commit()
        print("ESG Social data successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {str(e)}")
    finally:
        db.close()

seed_data()

@app.get("/")
def read_root():
    return {"message": "Welcome to the EcoSphere ESG Platform Social & Gamification API!"}
