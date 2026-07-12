from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class CSRActivityBase(BaseModel):
    title: str
    category: str
    description: str
    date: date
    status: str

class CSRActivity(CSRActivityBase):
    id: int
    class Config:
        from_attributes = True

class ChallengeBase(BaseModel):
    title: str
    difficulty: str
    xp_reward: int
    deadline: date
    status: str

class Challenge(ChallengeBase):
    id: int
    class Config:
        from_attributes = True

class ParticipationBase(BaseModel):
    employee_id: int
    activity_id: int

class Participation(ParticipationBase):
    id: int
    proof_path: Optional[str]
    approval_status: str
    points: int
    completion_date: datetime
    class Config:
        from_attributes = True

class AIVerificationResult(BaseModel):
    approved: bool
    reason: str
    xp: int
    badge: Optional[str] = None
