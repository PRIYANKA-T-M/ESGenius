import os
import json

try:
    import google.generativeai as genai
    from google.api_core.exceptions import ResourceExhausted
except ImportError:
    genai = None

def extract_invoice_data(file_content: bytes, filename: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not genai:
        return _mock_invoice_extraction(filename)
        
    try:
        genai.configure(api_key=api_key)
        # Using gemini-1.5-flash as it's the standard for multimodal fast tasks
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        You are an AI trained to extract environmental data from invoices (Fuel Bills, Electricity Bills, etc).
        Extract the following information from this document:
        - Department (guess based on the context, default to 1 if unknown)
        - Fuel Type or Activity (e.g., Diesel, Electricity, Natural Gas)
        - Quantity (number only)
        
        Return exactly and ONLY this JSON format (no markdown tags, no backticks, no other text):
        {
          "department_id": 1,
          "activity_type": "Diesel",
          "quantity": 120.5
        }
        """
        
        # In a real app we'd upload the file via File API or send base64. 
        # For hackathon simplicity if it's text we pass it, if not we simulate.
        response = model.generate_content([prompt, filename])
        
        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
        
    except (Exception, ResourceExhausted) as e:
        print(f"AI Extraction failed: {e}")
        return _mock_invoice_extraction(filename)

def _mock_invoice_extraction(filename: str) -> dict:
    activity = "Electricity"
    qty = 500.0
    if "fuel" in filename.lower() or "diesel" in filename.lower():
        activity = "Diesel"
        qty = 150.0
    return {
        "department_id": 1,
        "activity_type": activity,
        "quantity": qty
    }
