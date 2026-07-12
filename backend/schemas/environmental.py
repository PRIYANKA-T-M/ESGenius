from pydantic import BaseModel, computed_field
from datetime import date
from typing import Optional


# --- Department ---
class DepartmentCreate(BaseModel):
    name: str
    manager: str

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
    emission_factor: float
    transaction_date: date

class CarbonTransactionResponse(BaseModel):
    id: int
    department_id: int
    activity_type: str
    quantity: float
    emission_factor: float
    carbon_emission: float
    transaction_date: date
    class Config:
        from_attributes = True
