from backend.database import SessionLocal, engine
from backend.models.environmental import Base, Department, EmissionFactor

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed Departments
        departments = [
            {"name": "IT", "manager": "Alice Johnson"},
            {"name": "Operations", "manager": "Bob Smith"},
            {"name": "Logistics", "manager": "Carol Davis"},
        ]
        for d in departments:
            if not db.query(Department).filter(Department.name == d["name"]).first():
                db.add(Department(**d))

        # Seed Emission Factors (kg CO₂ per unit)
        emission_factors = [
            {"activity_type": "Diesel",      "unit": "litre",  "factor": 2.6808},
            {"activity_type": "Petrol",      "unit": "litre",  "factor": 2.3120},
            {"activity_type": "Electricity", "unit": "kWh",    "factor": 0.2330},
            {"activity_type": "Flight",      "unit": "km",     "factor": 0.2550},
            {"activity_type": "Train",       "unit": "km",     "factor": 0.0410},
        ]
        for ef in emission_factors:
            if not db.query(EmissionFactor).filter(EmissionFactor.activity_type == ef["activity_type"]).first():
                db.add(EmissionFactor(**ef))

        db.commit()
        print("[OK] Seed completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
