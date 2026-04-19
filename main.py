from rich.console import Console
from rich.table import Table
from rich.panel import Panel
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# Internal Imports
from config.settings import Settings
from src.engine.parser import extract_tender_rules
from src.engine.vector_store import create_bidder_vector_store
from src.graph.workflow import create_audit_graph

console = Console()

def run_bidder_audit(tender_path: str, bidder_dir: str, bidder_name: str):
    console.print(Panel(f"🚀 INITIATING AUDIT: {bidder_name}", style="bold green"))

    # 1. EXTRACT RULES (The Checklist)
    console.print("[yellow]📋 Step 1: Extracting Rules from Tender Rulebook...[/yellow]")
    tender_data = extract_tender_rules(tender_path)
    rules = tender_data.get("requirements", [])
    console.print(f"✅ Found {len(rules)} Mandatory Criteria.\n")

    # 2. INDEX DOCUMENTS (The Memory)
    console.print(f"[yellow]📦 Step 2: Indexing {bidder_name}'s Documents...[/yellow]")
    collection_name = bidder_name.lower().replace(" ", "_")
    v_db = create_bidder_vector_store(bidder_dir, collection_name)

    # 3. CONFIGURE GRAPH STATE
    initial_state = {
        "rules": rules,
        "results": [],
        "current_index": 0,
        "needs_review": False,
        "vector_db": v_db
    }

    # 4. EXECUTE THE AUTOPILOT
    console.print("[yellow]⚖️  Step 3: Running Autonomous Audit...[/yellow]")
    app = create_audit_graph()
    final_state = app.invoke(initial_state)

    # 5. GENERATE THE FINAL REPORT
    render_report(bidder_name, final_state)

def render_report(bidder_name, final_state):
    console.print(f"\n[bold underline yellow]FINAL AUDIT REPORT: {bidder_name.upper()}[/bold underline yellow]")
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Rule ID", style="dim")
    table.add_column("Requirement")
    table.add_column("Status", justify="center")
    table.add_column("Evidence Found", style="cyan")

    for result in final_state["results"]:
        status = "[bold green]PASS ✅[/bold green]" if result["is_eligible"] else "[bold red]FAIL ❌[/bold red]"
        
        evidence = result.get("evidence", {})
        found_val = evidence.get("found_value", "N/A") if evidence else "N/A"
        
        table.add_row(
            result["criterion_id"],
            result["reasoning"][:75] + "...",
            status,
            found_val
        )

    console.print(table)
    
    if final_state["needs_review"]:
        console.print("\n[bold red]⚠️  VERDICT: REJECTED / NEEDS HUMAN REVIEW[/bold red]")
    else:
        console.print("\n[bold green]✅ VERDICT: APPROVED (MANDATORY CRITERIA MET)[/bold green]")

if __name__ == "__main__":
    # --- CONFIGURATION ---
    TENDER_PDF = "data/tenders/CRPF_Rulebook.pdf"
    
    # Let's test Bidder A first
    BIDDER_FOLDER = "data/bidders/Bidder_A_AlphaCorp"
    BIDDER_NAME = "AlphaCorp Solutions"

    try:
        run_bidder_audit(TENDER_PDF, BIDDER_FOLDER, BIDDER_NAME)
    except Exception as e:
        console.print(f"[bold red]CRITICAL SYSTEM ERROR: {e}[/bold red]")