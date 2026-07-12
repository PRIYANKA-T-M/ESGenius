from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date
import datetime

# Fallback for SQLAlchemy declarative base
try:
    from backend.database import Base # type: ignore
except ImportError:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()

class CSRActivity(Base):
    __tablename__ = "csr_activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    description = Column(String)
    date = Column(Date)
    status = Column(String, default="UPCOMING")

class EmployeeParticipation(Base):
    __tablename__ = "employee_participation"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, index=True)
    activity_id = Column(Integer, ForeignKey("csr_activities.id"))
    proof_path = Column(String)
    approval_status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    points = Column(Integer, default=0)
    completion_date = Column(DateTime, default=datetime.datetime.utcnow)

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    difficulty = Column(String) # EASY, MEDIUM, HARD
    xp_reward = Column(Integer)
    deadline = Column(Date)
    status = Column(String, default="ACTIVE")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    unlock_rule = Column(String)
    icon = Column(String)
