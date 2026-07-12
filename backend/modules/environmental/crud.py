from sqlalchemy.orm import Session
from . import models, schemas
import datetime

def get_emission_factors(db: Session):
    return db.query(models.EmissionFactor).all()

def create_emission_factor(db: Session, factor: schemas.EmissionFactorBase):
    db_factor = models.EmissionFactor(**factor.dict())
    db.add(db_factor)
    db.commit()
    db.refresh(db_factor)
    return db_factor

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CarbonTransaction).order_by(models.CarbonTransaction.created_at.desc()).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.CarbonTransactionCreate):
    # Find matching emission factor
    factor = db.query(models.EmissionFactor).filter(
        models.EmissionFactor.activity_type.ilike(f"%{transaction.activity_type}%")
    ).first()
    
    emission_val = 0.0
    factor_id = None
    if factor:
        emission_val = transaction.quantity * factor.factor
        factor_id = factor.id
    else:
        # Fallback naive calculation
        emission_val = transaction.quantity * 2.5

    db_trans = models.CarbonTransaction(
        department_id=transaction.department_id,
        activity_type=transaction.activity_type,
        quantity=transaction.quantity,
        emission_factor_id=factor_id,
        carbon_emission=emission_val,
        source_document=transaction.source_document
    )
    db.add(db_trans)
    
    # Update Goal if exists
    goal = db.query(models.EnvironmentalGoal).filter(models.EnvironmentalGoal.department_id == transaction.department_id).first()
    if goal:
        goal.current_emission += emission_val
        if goal.current_emission > goal.target_emission:
            goal.status = "AT_RISK"
            
    db.commit()
    db.refresh(db_trans)
    return db_trans

def get_goals(db: Session):
    return db.query(models.EnvironmentalGoal).all()

def get_score(db: Session, department_id: int):
    # Calculate a 0-100 score based on goals vs current emissions
    goal = db.query(models.EnvironmentalGoal).filter(models.EnvironmentalGoal.department_id == department_id).first()
    if not goal:
        return {"score": 80, "breakdown": ["No specific goals set. Default baseline score."]}
    
    if goal.current_emission == 0:
        return {"score": 100, "breakdown": ["+20 No emissions recorded yet!"]}
        
    ratio = goal.current_emission / goal.target_emission
    if ratio < 0.5:
        score = 95
        breakdown = ["+15 Emissions well below target!"]
    elif ratio < 0.9:
        score = 75
        breakdown = ["+5 On track to meet goals."]
    elif ratio <= 1.0:
        score = 60
        breakdown = ["-15 Approaching emission limit."]
    else:
        score = 40
        breakdown = ["-40 Exceeded target emissions!"]
        
    return {"score": score, "breakdown": breakdown}
