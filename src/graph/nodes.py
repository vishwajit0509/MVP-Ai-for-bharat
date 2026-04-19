import yaml
import json
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
import sys
import os
# Internal Imports - Sticking to your existing settings.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from config.settings import model_pro
from src.schema import CriterionVerdict
from src.engine.vector_store import get_relevant_documents

console = Console()
# Path to your prompts
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROMPTS_PATH = BASE_DIR / "config" / "prompts.yaml"

def evaluate_next_rule_node(state):
    """
    The 'Judge' node: Uses the existing model_pro to audit rules.
    """
    current_idx = state["current_index"]
    rule = state["rules"][current_idx]
    v_db = state["vector_db"]
    
    console.print(Panel(f"🤖 Processing Rule {current_idx + 1}: {rule['id']}", border_style="magenta"))
    
    # 1. Search Vector Memory
    docs = get_relevant_documents(v_db, rule['description'], k=3)
    
    context = ""
    for doc in docs:
        source = doc.metadata.get('source', 'Unknown').split('/')[-1]
        context += f"\n--- Source: {source} ---\n{doc.page_content}\n"

    # 2. Load the Judge Prompt from YAML
    with open(PROMPTS_PATH, 'r') as f:
        prompts = yaml.safe_load(f)
    
    raw_prompt = prompts['judge_evaluation']
    final_prompt = raw_prompt.format(
        description=rule['description'],
        is_mandatory=rule['is_mandatory'],
        threshold=rule['threshold'],
        context=context
    )

    # 3. Call Gemini Pro using the standard genai logic
    console.print("🧠 [dim]Auditing evidence...[/dim]")
    
    # Using the generation_config style from your notebook
    response = model_pro.generate_content(
        final_prompt,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": CriterionVerdict
        }
    )
    
    # Manual JSON load since we aren't using the 'client' SDK
    verdict_dict = json.loads(response.text)

    # 4. Logic for Human Review Flag
    new_review_flag = state["needs_review"]
    if not verdict_dict.get("is_eligible") and rule['is_mandatory']:
        new_review_flag = True
        console.print("[bold red]⚠️  MANDATORY RULE FAILED[/bold red]")
    else:
        console.print("[bold green]✅ RULE PASSED[/bold green]")

    # 5. Return updates
    return {
        "results": [verdict_dict], 
        "current_index": current_idx + 1,
        "needs_review": new_review_flag
    }