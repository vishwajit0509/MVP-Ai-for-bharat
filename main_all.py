import os
import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

# Ensure the script can find your internal modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Internal Imports
from config.settings import Settings
from src.engine.parser import extract_tender_rules
from src.engine.vector_store import create_bidder_vector_store
from src.graph.workflow import create_audit_graph

console = Console()

def render_report(bidder_name, final_state):
    """Prints a beautiful summary table for the audit results."""
    console.print(f"\n[bold underline yellow]BATCH AUDIT RESULT: {bidder_name.upper()}[/bold underline yellow]")
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Rule ID", style="dim")
    table.add_column("Requirement")
    table.add_column("Status", justify="center")
    table.add_column("Evidence Found", style="cyan")

    for result in final_state["results"]:
        status = "[bold green]PASS ✅[/bold green]" if result["is_eligible"] else "[bold red]FAIL ❌[/bold red]"
        
        evidence = result.get("evidence", {})
        found_val = evidence.get("found_value", "N/A") if evidence else "N/A"
        
        # Truncate reasoning for table display
        short_reason = result["reasoning"][:75] + "..." if len(result["reasoning"]) > 75 else result["reasoning"]

        table.add_row(
            result["criterion_id"],
            short_reason,
            status,
            found_val
        )

    console.print(table)
    
    if final_state["needs_review"]:
        console.print(f"[bold red]⚠️  VERDICT FOR {bidder_name}: REJECTED / NEEDS HUMAN REVIEW[/bold red]\n")
    else:
        console.print(f"[bold green]✅ VERDICT FOR {bidder_name}: APPROVED (ALL CRITERIA MET)[/bold green]\n")

def main():
    # --- 1. GLOBAL CONFIG ---
    TENDER_PDF = "data/tenders/CRPF_Rulebook.pdf"
    
    bidders = [
        {"name": "AlphaCorp Solutions", "dir": "data/bidders/Bidder_A_AlphaCorp"},
        {"name": "BetaTech Industries", "dir": "data/bidders/Bidder_B_BetaTech"},
        {"name": "Gamma Infrastructure", "dir": "data/bidders/Bidder_C_GammaInfra"}
    ]

    console.print(Panel.fit("🏢 BHARAT TENDER AUDIT SYSTEM: BATCH MODE", style="bold white on blue"))

    # --- 2. EXTRACT RULES ONCE ---
    console.print("[yellow]📋 Step 1: Extracting Master Rules from Tender...[/yellow]")
    try:
        tender_data = extract_tender_rules(TENDER_PDF)
        rules = tender_data.get("requirements", [])
        console.print(f"✅ Found {len(rules)} Mandatory Criteria to audit against.\n")
    except Exception as e:
        console.print(f"[bold red]FATAL: Could not read Tender Rulebook. {e}[/bold red]")
        return

    # --- 3. LOOP THROUGH BIDDERS ---
    app = create_audit_graph()

    for bidder in bidders:
        console.print(f"[bold cyan]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold cyan]")
        console.print(f"🔍 [bold white]AUDITING:[/bold white] [bold green]{bidder['name']}[/bold green]")
        console.print(f"[bold cyan]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold cyan]")

        try:
            # Index the specific bidder documents (PDF or OCR)
            coll_name = bidder['name'].lower().replace(" ", "_")
            v_db = create_bidder_vector_store(bidder['dir'], coll_name)

            if not v_db:
                console.print(f"[red]Skipping {bidder['name']} - No documents found.[/red]")
                continue

            # Prepare Graph State
            initial_state = {
                "rules": rules,
                "results": [],
                "current_index": 0,
                "needs_review": False,
                "vector_db": v_db
            }

            # Run Autopilot
            final_state = app.invoke(initial_state)

            # Show Report
            render_report(bidder['name'], final_state)

        except Exception as e:
            console.print(f"[bold red]❌ Error during audit of {bidder['name']}: {e}[/bold red]")

if __name__ == "__main__":
    main()