from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
import datetime

# Fallback for SQLAlchemy declarative base
try:
    from backend.database import Base # type: ignore
except ImportError:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String, index=True) # e.g. "Diesel", "Electricity"
    unit = Column(String) # e.g. "liters", "kWh"
    factor = Column(Float) # carbon per unit

class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, index=True)
    activity_type = Column(String)
    quantity = Column(Float)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"))
    carbon_emission = Column(Float)
    source_document = Column(String) # e.g. "fuel_bill_001.pdf"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goals"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, index=True)
    target_emission = Column(Float)
    current_emission = Column(Float, default=0.0)
    deadline = Column(Date)
    status = Column(String, default="ON_TRACK") # ON_TRACK, AT_RISK, ACHIEVED
