import os

from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)
import json
import google.generativeai as genai
from PIL import Image

def verify_proof_with_gemini(image_path: str, activity_description: str) -> dict:
    """
    Calls the Gemini Vision API (gemini-1.5-flash) to evaluate whether an uploaded image
    constitutes valid proof for a specified CSR activity description.
    
    Returns a dictionary: {"approved": bool, "reason": str}
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "approved": False,
            "reason": "Gemini API key is not configured in backend environment (.env)."
        }
    
    # Configure GenAI library
    genai.configure(api_key=api_key)
    
    # Load the proof image
    if not os.path.exists(image_path):
        return {
            "approved": False,
            "reason": f"Proof image file not found on server at {image_path}."
        }
        
    try:
        img = Image.open(image_path)
    except Exception as e:
        return {
            "approved": False,
            "reason": f"Failed to load image file. Details: {str(e)}"
        }
    
    # Construct verification prompt
    prompt = (
        "You are an automated CSR auditing agent verifying employee participation proof.\n"
        f"The CSR activity is: '{activity_description}'.\n"
        "Examine the attached image. Determine if the image shows genuine, plausible proof "
        "of participation in this activity. For example, if it's planting trees, it should show plants, soil, "
        "shovels, or active gardening. If it's recycling, it should show recycling bins, sorted waste, or a recycling center.\n\n"
        "Respond STRICTLY in JSON format with two fields: 'approved' (boolean) and 'reason' (string explaining the decision).\n"
        "Example response:\n"
        "{\n"
        "  \"approved\": true,\n"
        "  \"reason\": \"The image clearly shows plastic bottles sorted in a green recycling bin.\"\n"
        "}"
    )
    
    try:
        # Call gemini-1.5-flash
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([prompt, img])
        
        if not response or not response.text:
            return {
                "approved": False,
                "reason": "Received empty response from Gemini API."
            }
            
        text = response.text.strip()
        
        # Strip markdown json code blocks if returned
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove start backticks
            if lines[0].startswith("```"):
                lines = lines[1:]
            # Remove end backticks
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        # Parse JSON output
        result = json.loads(text)
        return {
            "approved": bool(result.get("approved", False)),
            "reason": str(result.get("reason", "Verification complete."))
        }
    except json.JSONDecodeError as jde:
        # If parsing JSON failed, try to fallback to regex/word check or return raw text
        text_lower = response.text.lower() if 'response' in locals() and response.text else ""
        if '"approved": true' in text_lower or '"approved":true' in text_lower:
            return {
                "approved": True,
                "reason": "Successfully parsed proof via fallback parser."
            }
        return {
            "approved": False,
            "reason": f"Gemini returned non-JSON response structure: {response.text[:200]}"
        }
    except Exception as e:
        return {
            "approved": False,
            "reason": f"Gemini verification request encountered an error: {str(e)}"
        }
