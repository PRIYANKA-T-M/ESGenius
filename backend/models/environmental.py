from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    manager = Column(String, nullable=False)

    transactions = relationship("CarbonTransaction", back_populates="department")


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String, unique=True, nullable=False)
    unit = Column(String, nullable=False)
    factor = Column(Float, nullable=False)


class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    emission_factor = Column(Float, nullable=False)
    carbon_emission = Column(Float, nullable=False)
    transaction_date = Column(Date, nullable=False)

    department = relationship("Department", back_populates="transactions")
