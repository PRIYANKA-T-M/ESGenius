from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class EmissionFactorBase(BaseModel):
    activity_type: str
    unit: str
    factor: float

class EmissionFactor(EmissionFactorBase):
    id: int
    class Config:
        from_attributes = True

class CarbonTransactionBase(BaseModel):
    department_id: int
    activity_type: str
    quantity: float
    source_document: Optional[str] = None

class CarbonTransactionCreate(CarbonTransactionBase):
    pass

class CarbonTransaction(CarbonTransactionBase):
    id: int
    emission_factor_id: Optional[int]
    carbon_emission: float
    created_at: datetime
    class Config:
        from_attributes = True

class EnvironmentalGoalBase(BaseModel):
    department_id: int
    target_emission: float
    deadline: date

class EnvironmentalGoal(EnvironmentalGoalBase):
    id: int
    current_emission: float
    status: str
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    total_emissions: float
    monthly_emissions: float
    department_score: float
    goals_achieved: int
