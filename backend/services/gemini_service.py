import os
import json
import google.generativeai as genai
from fastapi import HTTPException

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
_API_KEY = os.getenv("GEMINI_API_KEY")
if not _API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")

genai.configure(api_key=_API_KEY)
_MODEL = genai.GenerativeModel("gemini-1.5-flash")

# ---------------------------------------------------------------------------
# Allowed MIME types
# ---------------------------------------------------------------------------
SUPPORTED_MIME_TYPES = {
    "image/png":        "image/png",
    "image/jpeg":       "image/jpeg",
    "image/jpg":        "image/jpeg",
    "application/pdf":  "application/pdf",
}

# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------
_EXTRACTION_PROMPT = """
You are an ESG data extraction assistant.

Analyze the attached fuel or energy invoice and extract the following fields:

- department   : The department or company name mentioned on the invoice.
- activity_type: The type of fuel or energy. Must be exactly one of: Diesel, Petrol, Electricity, Flight, Train.
- quantity     : The numeric quantity consumed (e.g. 150.0).
- unit         : The unit of measurement (e.g. litres, kWh, km).

Rules:
1. Return ONLY a valid JSON object. No explanation, no markdown, no code fences.
2. All keys must be lowercase snake_case exactly as shown above.
3. quantity must be a number (float or int), not a string.
4. If a field cannot be determined from the invoice, set its value to null.

Expected output format:
{
  "department": "Logistics",
  "activity_type": "Diesel",
  "quantity": 150.0,
  "unit": "litres"
}
"""

# ---------------------------------------------------------------------------
# Valid activity types — must match emission_factors.activity_type seed data
# ---------------------------------------------------------------------------
VALID_ACTIVITY_TYPES = {"Diesel", "Petrol", "Electricity", "Flight", "Train"}


# ---------------------------------------------------------------------------
# Public function called by the route
# ---------------------------------------------------------------------------
def extract_invoice_data(file_bytes: bytes, mime_type: str) -> dict:
    """
    Upload invoice bytes to Gemini Flash and return extracted fields as a dict.

    Raises HTTPException on every failure so the route stays clean.
    """
    if mime_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{mime_type}'. Accepted: PNG, JPEG, PDF.",
        )

    # --- call Gemini ---
    try:
        response = _MODEL.generate_content(
            [
                {"mime_type": SUPPORTED_MIME_TYPES[mime_type], "data": file_bytes},
                _EXTRACTION_PROMPT,
            ],
            request_options={"timeout": 30},
        )
    except Exception as exc:
        # network / quota / timeout errors from the SDK
        raise HTTPException(
            status_code=503,
            detail=f"Gemini service unavailable: {str(exc)}",
        )

    # --- parse response text ---
    raw_text = (response.text or "").strip()
    if not raw_text:
        raise HTTPException(
            status_code=400,
            detail="Gemini returned an empty response. The invoice may be unreadable.",
        )

    # strip accidental markdown fences Gemini sometimes adds
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.lower().startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Gemini response was not valid JSON. The invoice may be unreadable.",
        )

    # --- field validation ---
    missing = [f for f in ("department", "activity_type", "quantity", "unit") if data.get(f) is None]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Gemini could not extract required fields: {missing}. Check invoice quality.",
        )

    if data["activity_type"] not in VALID_ACTIVITY_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Extracted activity_type '{data['activity_type']}' is not recognised. "
                f"Must be one of: {sorted(VALID_ACTIVITY_TYPES)}."
            ),
        )

    try:
        data["quantity"] = float(data["quantity"])
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail=f"Extracted quantity '{data['quantity']}' is not a valid number.",
        )

    return data
