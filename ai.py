import os
import json
from fastapi import UploadFile

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

if HAS_GENAI:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "dummy_key"))
    # Enforce JSON output at the API level
    model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
else:
    model = None

async def summarize_policy(file: UploadFile):
    """
    Extracts text from a PDF (mocked here) and sends it to Gemini to get a structured JSON response.
    """
    # Note: In a real scenario, use PyPDF2 or pdfplumber to extract text from `file.file`
    text = "Sample policy text for demonstration. Please ensure compliance by the end of Q3."
    
    prompt = f"""
    Analyze the following policy document and extract key information.
    Return ONLY a valid JSON object with the exact following schema:
    {{
        "summary": "A concise summary of the policy in 2-3 sentences.",
        "top_risks": ["risk 1", "risk 2"],
        "checklist": ["action item 1", "action item 2"]
    }}
    
    Policy Text:
    {text}
    """
    
    if HAS_GENAI and os.environ.get("GEMINI_API_KEY"):
        try:
            response = model.generate_content(prompt)
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            
    # Fallback for local testing without API key or network
    return {
        "summary": f"This is a fallback summary for {file.filename} (Gemini API disabled or failed).",
        "top_risks": ["Unconfigured API key", "Missing compliance data"],
        "checklist": ["Configure GEMINI_API_KEY", "Review policy manually"]
    }

async def draft_compliance_email(issue):
    """
    Drafts a professional email for an overdue compliance issue using Gemini.
    """
    prompt = f"""
    Draft a professional but urgent email to an employee reminding them about an overdue compliance issue.
    
    Issue Title: {issue.title}
    Department ID: {issue.department_id}
    Due Date: {issue.due_date}
    Severity: {issue.severity.value}
    
    Return ONLY a valid JSON object with the exact following schema:
    {{
        "subject": "The email subject line",
        "body": "The full email body text with placeholders like [Employee Name]"
    }}
    """
    
    if HAS_GENAI and os.environ.get("GEMINI_API_KEY"):
        try:
            response = model.generate_content(prompt)
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            
    # Fallback for local testing
    return {
        "subject": f"Action Required: Overdue Compliance - {issue.title}",
        "body": f"Dear [Employee Name],\n\nPlease note that your compliance issue '{issue.title}' for the {issue.department} department was due on {issue.due_date}. As this is a {issue.severity.value} severity issue, please resolve it immediately to avoid negative impact on our Governance Score.\n\nThank you,\nGovernance Team"
    }
