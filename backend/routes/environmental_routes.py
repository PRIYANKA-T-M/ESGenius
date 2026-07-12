from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models.environmental import Department, EmissionFactor, CarbonTransaction
from backend.schemas.environmental import (
    DepartmentCreate, DepartmentResponse,
    EmissionFactorCreate, EmissionFactorResponse,
    CarbonTransactionCreate, CarbonTransactionResponse,
)

router = APIRouter()


# --- Departments ---
@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments", response_model=DepartmentResponse, status_code=201)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    if db.query(Department).filter(Department.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Department already exists.")
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


# --- Emission Factors ---
@router.get("/emission-factors", response_model=List[EmissionFactorResponse])
def get_emission_factors(db: Session = Depends(get_db)):
    return db.query(EmissionFactor).all()

@router.post("/emission-factors", response_model=EmissionFactorResponse, status_code=201)
def create_emission_factor(payload: EmissionFactorCreate, db: Session = Depends(get_db)):
    if db.query(EmissionFactor).filter(EmissionFactor.activity_type == payload.activity_type).first():
        raise HTTPException(status_code=400, detail="Emission factor for this activity already exists.")
    ef = EmissionFactor(**payload.model_dump())
    db.add(ef)
    db.commit()
    db.refresh(ef)
    return ef


# --- Carbon Transactions ---
@router.get("/carbon-transactions", response_model=List[CarbonTransactionResponse])
def get_carbon_transactions(db: Session = Depends(get_db)):
    return db.query(CarbonTransaction).all()

@router.post("/carbon-transactions", response_model=CarbonTransactionResponse, status_code=201)
def create_carbon_transaction(payload: CarbonTransactionCreate, db: Session = Depends(get_db)):
    if not db.query(Department).filter(Department.id == payload.department_id).first():
        raise HTTPException(status_code=404, detail="Department not found.")
    
    carbon_emission = round(payload.quantity * payload.emission_factor, 4)
    
    txn = CarbonTransaction(
        **payload.model_dump(),
        carbon_emission=carbon_emission,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn
