from enum import Enum as PyEnum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import declarative_base, relationship

# Fallback Base to allow the module to be standalone for testing.
# In production, this would be imported from the shared database module:
# from backend.database import Base
try:
    from backend.database import Base
except ImportError:
    Base = declarative_base()

class ComplianceStatus(PyEnum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    OVERDUE = "OVERDUE"

class Severity(PyEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Policy(Base):
    __tablename__ = "gov_policies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    version = Column(String, default="1.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    issues = relationship("ComplianceIssue", back_populates="policy")

class ComplianceIssue(Base):
    __tablename__ = "gov_compliance_issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    policy_id = Column(Integer, ForeignKey("gov_policies.id"), nullable=True)
    owner_id = Column(String, index=True, nullable=False) # Simplified as per feedback
    department = Column(String, index=True, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(ComplianceStatus), default=ComplianceStatus.OPEN, index=True)
    severity = Column(Enum(Severity), default=Severity.LOW, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    policy = relationship("Policy", back_populates="issues")
