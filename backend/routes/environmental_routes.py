from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from backend.database import get_db
from backend.models.environmental import Department, EmissionFactor, CarbonTransaction, EnvironmentalGoal
from backend.schemas.environmental import (
    DepartmentCreate, DepartmentResponse,
    EmissionFactorCreate, EmissionFactorResponse,
    CarbonTransactionCreate, CarbonTransactionResponse,
    EnvironmentalGoalCreate, EnvironmentalGoalResponse,
    DashboardResponse,
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
    if payload.parent_department_id:
        if not db.query(Department).filter(Department.id == payload.parent_department_id).first():
            raise HTTPException(status_code=404, detail="Parent department not found.")
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

    ef = db.query(EmissionFactor).filter(EmissionFactor.id == payload.emission_factor_id).first()
    if not ef:
        raise HTTPException(status_code=404, detail="Emission factor not found.")

    carbon_emission = round(payload.quantity * ef.factor, 4)   # factor looked up from DB

    txn = CarbonTransaction(
        department_id=payload.department_id,
        activity_type=payload.activity_type,
        quantity=payload.quantity,
        emission_factor_id=payload.emission_factor_id,
        carbon_emission=carbon_emission,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


# --- Dashboard ---
@router.get("/environment/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_departments = db.query(func.count(Department.id)).scalar() or 0
    total_transactions = db.query(func.count(CarbonTransaction.id)).scalar() or 0
    total_carbon_emission = round(db.query(func.sum(CarbonTransaction.carbon_emission)).scalar() or 0.0, 4)

    # Department with highest total carbon emission
    top = (
        db.query(Department.name, func.sum(CarbonTransaction.carbon_emission).label("total"))
        .join(CarbonTransaction, CarbonTransaction.department_id == Department.id)
        .group_by(Department.id)
        .order_by(func.sum(CarbonTransaction.carbon_emission).desc())
        .first()
    )
    if top is None:
        raise HTTPException(status_code=404, detail="No transaction data available for dashboard.")

    highest_emission_department = top.name
    highest_emission_value = round(top.total, 4)

    # Average goal completion: avg(current / target * 100) across all goals
    goals = db.query(EnvironmentalGoal.current, EnvironmentalGoal.target).all()
    if not goals:
        goal_completion = 0.0
    else:
        goal_completion = round(
            sum((g.current / g.target * 100) for g in goals if g.target > 0) / len(goals), 2
        )

    return DashboardResponse(
        total_departments=total_departments,
        total_transactions=total_transactions,
        total_carbon_emission=total_carbon_emission,
        highest_emission_department=highest_emission_department,
        highest_emission_value=highest_emission_value,
        goal_completion=goal_completion,
    )


# --- Environmental Goals ---
@router.get("/environmental-goals", response_model=List[EnvironmentalGoalResponse])
def get_environmental_goals(db: Session = Depends(get_db)):
    return db.query(EnvironmentalGoal).all()

@router.post("/environmental-goals", response_model=EnvironmentalGoalResponse, status_code=201)
def create_environmental_goal(payload: EnvironmentalGoalCreate, db: Session = Depends(get_db)):
    if not db.query(Department).filter(Department.id == payload.department_id).first():
        raise HTTPException(status_code=404, detail="Department not found.")
    goal = EnvironmentalGoal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal
