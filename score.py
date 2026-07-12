from typing import List, Dict, Any
from sqlalchemy.orm import Session
from . import models

def calculate_department_score(db: Session, department_id: int) -> Dict[str, Any]:
    """
    Calculates the explainable Governance Score for a specific department.
    Base score: 100
    Deductions: Open (-1), Medium (-2), High (-5), Critical (-10)
    Additions: Closed issue (+2)
    """
    issues = db.query(models.ComplianceIssue).filter(models.ComplianceIssue.department_id == department_id).all()
    
    score = 100
    breakdown = []
    
    for issue in issues:
        if issue.status == models.ComplianceStatus.OPEN or issue.status == models.ComplianceStatus.OVERDUE:
            if issue.severity == models.Severity.CRITICAL:
                score -= 10
                breakdown.append(f"-10 for Critical Issue: {issue.title}")
            elif issue.severity == models.Severity.HIGH:
                score -= 5
                breakdown.append(f"-5 for High Issue: {issue.title}")
            elif issue.severity == models.Severity.MEDIUM:
                score -= 2
                breakdown.append(f"-2 for Medium Issue: {issue.title}")
            elif issue.severity == models.Severity.LOW:
                score -= 1
                breakdown.append(f"-1 for Low Issue: {issue.title}")
        elif issue.status == models.ComplianceStatus.CLOSED:
            score += 2
            breakdown.append(f"+2 for Closed Issue: {issue.title}")
            
    # Cap score between 0 and 100
    if score > 100:
        score = 100
    elif score < 0:
        score = 0
        
    return {
        "department_id": department_id,
        "governance_score": score,
        "breakdown": breakdown
    }
