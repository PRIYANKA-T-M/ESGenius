from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# --- Department ---
class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None
    head: Optional[str] = None                    # renamed from manager
    parent_department_id: Optional[int] = None
    employee_count: Optional[int] = 0
    status: Optional[str] = "active"

class DepartmentResponse(DepartmentCreate):
    id: int
    class Config:
        from_attributes = True


# --- Emission Factor ---
class EmissionFactorCreate(BaseModel):
    activity_type: str
    unit: str
    factor: float

class EmissionFactorResponse(EmissionFactorCreate):
    id: int
    class Config:
        from_attributes = True


# --- Carbon Transaction ---
class CarbonTransactionCreate(BaseModel):
    department_id: int
    activity_type: str
    quantity: float
    emission_factor_id: int                       # was emission_factor: float

class CarbonTransactionResponse(BaseModel):
    id: int
    department_id: int
    activity_type: str
    quantity: float
    emission_factor_id: int
    carbon_emission: float
    created_at: datetime                          # replaces transaction_date
    class Config:
        from_attributes = True


# --- Environmental Goal ---
class EnvironmentalGoalCreate(BaseModel):
    department_id: int
    target: float
    current: Optional[float] = 0.0
    deadline: datetime

class EnvironmentalGoalResponse(EnvironmentalGoalCreate):
    id: int
    class Config:
        from_attributes = True
