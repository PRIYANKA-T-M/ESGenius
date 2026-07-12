from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    participations = relationship("EmployeeParticipation", back_populates="employee", cascade="all, delete-orphan")
    challenge_participations = relationship("ChallengeParticipation", back_populates="employee", cascade="all, delete-orphan")
    badges = relationship("EmployeeBadge", back_populates="employee", cascade="all, delete-orphan")

class CSRActivity(Base):
    __tablename__ = "csr_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    xp_reward = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    participations = relationship("EmployeeParticipation", back_populates="csr_activity", cascade="all, delete-orphan")

class EmployeeParticipation(Base):
    __tablename__ = "employee_participation"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    csr_activity_id = Column(Integer, ForeignKey("csr_activities.id"), nullable=False)
    proof_image_url = Column(String, nullable=True)
    approval_status = Column(String, default="Pending", nullable=False) # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="participations")
    csr_activity = relationship("CSRActivity", back_populates="participations")

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    xp_reward = Column(Integer, default=0, nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    badge = relationship("Badge", back_populates="challenges")
    participations = relationship("ChallengeParticipation", back_populates="challenge", cascade="all, delete-orphan")

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participation"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    status = Column(String, default="Joined", nullable=False) # Joined, Completed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="challenge_participations")
    challenge = relationship("Challenge", back_populates="participations")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    icon_url = Column(String, nullable=True)
    xp_required = Column(Integer, default=0, nullable=False) # XP required to unlock
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    challenges = relationship("Challenge", back_populates="badge")
    employee_badges = relationship("EmployeeBadge", back_populates="badge", cascade="all, delete-orphan")

class EmployeeBadge(Base):
    __tablename__ = "employee_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="badges")
    badge = relationship("Badge", back_populates="employee_badges")
