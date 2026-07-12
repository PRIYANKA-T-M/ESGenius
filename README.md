# Governance Module Integration Guide

Dear Team Leader,

The Governance module is complete and ready for integration. Here is how you can merge it into the shared application:

### Backend Integration
1. **Database:** Ensure `backend/database.py` imports our models so SQLAlchemy creates the tables:
   ```python
   import backend.modules.governance.models
   ```
2. **Router:** Mount the governance router in `backend/main.py`:
   ```python
   from backend.modules.governance.router import router as governance_router
   app.include_router(governance_router, prefix="/api/governance", tags=["Governance"])
   ```

### Frontend Integration
1. **Routing:** Add the route in `frontend/src/App.jsx`:
   ```jsx
   import Governance from './modules/governance/Governance';
   
   // Inside your Routes block:
   <Route path="/governance" element={<Governance />} />
   ```
2. **Sidebar:** Add the navigation link in `frontend/src/Sidebar.jsx`:
   ```jsx
   <Link to="/governance" className="nav-link">Governance</Link>
   ```

### Environment Variables
For the AI Policy Summarization and Email Drafting to work, ensure the environment where FastAPI runs has the following variable set:
```bash
GEMINI_API_KEY="your_actual_gemini_flash_key"
```
*(If the key is missing or fails, the module gracefully falls back to mock data, so the demo won't crash).*
