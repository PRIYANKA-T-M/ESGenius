from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=True)
    head = Column(String, nullable=True)                          # renamed from manager
    parent_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    employee_count = Column(Integer, nullable=True, default=0)
    status = Column(String, nullable=True, default="active")

    parent = relationship("Department", remote_side="Department.id", backref="sub_departments")
    transactions = relationship("CarbonTransaction", back_populates="department")
    goals = relationship("EnvironmentalGoal", back_populates="department")


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String, unique=True, nullable=False)
    unit = Column(String, nullable=False)
    factor = Column(Float, nullable=False)

    transactions = relationship("CarbonTransaction", back_populates="emission_factor_ref")


class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"), nullable=False)  # was Float emission_factor
    carbon_emission = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)  # replaces transaction_date

    department = relationship("Department", back_populates="transactions")
    emission_factor_ref = relationship("EmissionFactor", back_populates="transactions")


class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goals"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    target = Column(Float, nullable=False)
    current = Column(Float, nullable=False, default=0.0)
    deadline = Column(DateTime, nullable=False)

    department = relationship("Department", back_populates="goals")
