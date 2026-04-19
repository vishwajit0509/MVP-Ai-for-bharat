import PIL.Image
import json
import yaml
from pathlib import Path
from pypdf import PdfReader
import google.generativeai as genai
import sys
import os

# Internal imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from config.settings import model_flash, model_pro
from src.schema import TenderRequirementList

# Setup path to prompts
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROMPTS_PATH = BASE_DIR / "config" / "prompts.yaml"

def load_prompt(key: str) -> str:
    """Helper to load a specific prompt from the YAML file."""
    with open(PROMPTS_PATH, 'r') as f:
        prompts = yaml.safe_load(f)
    return prompts.get(key, "")

def extract_tender_rules(pdf_path: str) -> dict:
    """
    Reads the Tender PDF and uses Gemini Pro to extract 
    structured rules based on the YAML prompt.
    """
    try:
        reader = PdfReader(pdf_path)
        tender_text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                tender_text += content + "\n"
        
        # Load prompt from YAML and inject text
        raw_prompt = load_prompt("tender_extraction")
        extraction_prompt = raw_prompt.format(text=tender_text)
        
        response = model_pro.generate_content(
            extraction_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=TenderRequirementList
            )
        )
        return json.loads(response.text)
    
    except Exception as e:
        print(f"❌ Error in Tender Extraction: {e}")
        return {}

def perform_vision_ocr(image_path: str) -> str:
    """
    Uses Gemini Flash to analyze scanned images using the YAML prompt.
    """
    try:
        scanned_img = PIL.Image.open(image_path)
        vision_prompt = load_prompt("vision_ocr")
        
        response = model_flash.generate_content([vision_prompt, scanned_img])
        return response.text
    
    except Exception as e:
        print(f"❌ Error in Vision OCR: {e}")
        return ""