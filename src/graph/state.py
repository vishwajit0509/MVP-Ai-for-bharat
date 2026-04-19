import operator
from typing import Annotated, Dict, List, TypedDict, Any

class AuditState(TypedDict):
    """
    The shared memory (State) for our LangGraph workflow.
    """
    
    rules: List[Dict[str, Any]]
    
    
    results: Annotated[List[Dict[str, Any]], operator.add]
    
    
    current_index: int
    
   
    needs_review: bool
    
    
    vector_db: Any


    