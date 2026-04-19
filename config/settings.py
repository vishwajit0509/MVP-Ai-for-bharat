import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# 1. Setup Base Directory
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings:
    """Central configuration for the AI Pipeline."""
    
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    # Updated to the latest stable versions
    FLASH_MODEL = "gemini-2.5-flash" 
    PRO_MODEL = "gemini-2.5-pro"
    EMBEDDING_MODEL = "models/gemini-embedding-001" 

    @staticmethod
    def configure_genai():
        if not Settings.GOOGLE_API_KEY:
            # We use a print here for the console, but in production, you'd use a logger
            print("❌ ERROR: GOOGLE_API_KEY not found in .env!")
            return False
        
        genai.configure(api_key=Settings.GOOGLE_API_KEY)
        return True


if Settings.configure_genai():
    print("✅ Gemini API Configured.")


model_flash = genai.GenerativeModel(Settings.FLASH_MODEL)
model_pro = genai.GenerativeModel(Settings.PRO_MODEL)


if __name__ == "__main__":
    
    print(f"Testing Settings...")
    print(f"Base Directory: {BASE_DIR}")
    print(f"Flash Model: {model_flash.model_name}")
    print(f"Pro Model: {model_pro.model_name}")