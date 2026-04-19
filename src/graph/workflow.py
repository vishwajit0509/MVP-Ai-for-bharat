from langgraph.graph import StateGraph, END
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from src.graph.state import AuditState
from src.graph.nodes import evaluate_next_rule_node

def should_continue(state: AuditState):
    """Router: Check if there are more rules to process."""
    if state["current_index"] < len(state["rules"]):
        return "continue"
    return "end"

def create_audit_graph():
    """Compiles the workflow into an executable app."""
    workflow = StateGraph(AuditState)

    # Add the node we just fixed
    workflow.add_node("evaluator", evaluate_next_rule_node)

    workflow.set_entry_point("evaluator")

    # The Loop logic
    workflow.add_conditional_edges(
        "evaluator",
        should_continue,
        {
            "continue": "evaluator",
            "end": END
        }
    )

    return workflow.compile()