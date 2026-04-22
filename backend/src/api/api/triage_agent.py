"""
Triage Agent Module
===================
The Triage Agent is the first point of contact in the multi-agent support system.

Responsibilities:
- Receive the user's initial query
- Classify the query into one of three categories:
  * "billing" - for payment and subscription related questions
  * "refund" - for refund requests and issues
  * "general" - for all other inquiries
- Return the category string to be used by the routing node

The triage agent ensures queries are directed to the most appropriate
specialist, improving response quality and efficiency.
"""

# =============================================================================
# Imports
# =============================================================================

# Import shared components from the config module
from .config import model, config, Agent, AgentState

# =============================================================================
# Agent Definition
# =============================================================================

# Initialize the Triage Agent with name, model, and instructions
triage_agent = Agent(
    name="Triage Agent",

    # Use the Llama model configured in config.py
    model=model,

    # Instructions define the agent's role and behavior
    # These are injected into the system prompt for the LLM
    instructions="""
    You are a Triage Support Specialist.

    Your role is to classify incoming customer queries into one of three categories:
    - "billing" - for payment, subscription, invoice, or charge-related questions
    - "refund" - for refund requests, return policies, or money-back inquiries
    - "general" - for all other support topics

    Classification Guidelines:
    - Look for keywords: payment, charge, invoice, subscription → billing
    - Look for keywords: refund, return, money back, cancel order → refund
    - If unclear, default to "general"

    Response Format:
    - Return ONLY the category word: "billing", "refund", or "general"
    - Do not include explanation or punctuation
    - Be decisive - always return a category

    If the query is completely unrelated to customer support:
    - Still classify it, but note it may need transfer
    """,
)