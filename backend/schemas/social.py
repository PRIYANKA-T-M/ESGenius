from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Employee Schemas
class EmployeeBase(BaseModel):
    name: str
    email: EmailStr

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    xp: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# CSR Activity Schemas
class CSRActivityBase(BaseModel):
    title: str
    description: str
    date: datetime
    xp_reward: int

class CSRActivityCreate(CSRActivityBase):
    pass

class CSRActivityResponse(CSRActivityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Employee Participation Schemas
class EmployeeParticipationBase(BaseModel):
    employee_id: int
    csr_activity_id: int

class EmployeeParticipationCreate(EmployeeParticipationBase):
    pass

class EmployeeParticipationResponse(EmployeeParticipationBase):
    id: int
    proof_image_url: Optional[str] = None
    approval_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Badge Schemas
class BadgeBase(BaseModel):
    name: str
    description: str
    icon_url: Optional[str] = None
    xp_required: int

class BadgeCreate(BadgeBase):
    pass

class BadgeResponse(BadgeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Challenge Schemas
class ChallengeBase(BaseModel):
    title: str
    description: str
    start_date: datetime
    end_date: datetime
    xp_reward: int
    badge_id: Optional[int] = None

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeResponse(ChallengeBase):
    id: int
    created_at: datetime
    badge: Optional[BadgeResponse] = None

    class Config:
        from_attributes = True

# Challenge Participation Schemas
class ChallengeParticipationBase(BaseModel):
    employee_id: int
    challenge_id: int

class ChallengeParticipationCreate(ChallengeParticipationBase):
    pass

class ChallengeParticipationResponse(ChallengeParticipationBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Employee Badge Schemas
class EmployeeBadgeResponse(BaseModel):
    id: int
    employee_id: int
    badge_id: int
    unlocked_at: datetime
    badge: BadgeResponse

    class Config:
        from_attributes = True

# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    id: int
    name: str
    xp: int

    class Config:
        from_attributes = True
