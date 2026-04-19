from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# ==========================================
# 1. TENDER EXTRACTION SCHEMAS (The Rules)
# ==========================================

class TenderCriterion(BaseModel):
    """Represents a single rule extracted from the Tender document."""
    id: str = Field(description="Unique identifier like CRIT_001")
    category: str = Field(description="Technical, Financial, or Compliance")
    description: str = Field(description="The actual rule text (e.g., Minimum turnover of 5 Crore)")
    is_mandatory: bool = Field(description="True if this is a 'must-have' requirement")
    threshold: str = Field(description="Specific numerical value or exact keyword to match against")

class TenderRequirementList(BaseModel):
    """A collection of all rules extracted from the Tender."""
    requirements: List[TenderCriterion]


# ==========================================
# 2. EVALUATION SCHEMAS (The Verdicts)
# ==========================================

class BidderEvidence(BaseModel):
    """The specific proof found in the bidder's documents."""
    status: Literal["Found", "Missing", "Ambiguous"]
    found_value: Optional[str] = Field(description="The exact value found in the document (e.g., 12.5 Crore)")
    source_document: str = Field(description="Name of the file where evidence was found")
    snippet: str = Field(description="A short 1-sentence quote from the document proving the value")

class CriterionVerdict(BaseModel):
    """The final AI judgement for a single rule."""
    criterion_id: str
    is_eligible: bool
    reasoning: str = Field(description="Step-by-step explanation of why they passed or failed")
    evidence: Optional[BidderEvidence]