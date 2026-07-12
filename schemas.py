from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional
from .models import ComplianceStatus, Severity

# Policy Schemas
class PolicyBase(BaseModel):
    title: str
    description: Optional[str] = None
    version: Optional[str] = "1.0"

class PolicyCreate(PolicyBase):
    pass

class PolicyResponse(PolicyBase):
    id: int
    file_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Compliance Issue Schemas
class ComplianceIssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    policy_id: Optional[int] = None
    owner_id: str
    department: str
    due_date: date
    severity: Severity

class ComplianceIssueCreate(ComplianceIssueBase):
    pass

class ComplianceIssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None
    department: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[ComplianceStatus] = None
    severity: Optional[Severity] = None

class ComplianceIssueResponse(ComplianceIssueBase):
    id: int
    status: ComplianceStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
