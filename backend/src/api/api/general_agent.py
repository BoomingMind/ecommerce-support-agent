"""
General Agent Module
====================
The General Agent handles all non-specialized customer inquiries.

Responsibilities:
- Answer general support questions that don't fall into billing or refund categories
- Provide information about products, services, and policies
- Help with common issues and frequently asked questions
- Ask for order ID if not provided (required for verification)
- Transfer to specialized agents when query clearly belongs to billing/refund

This agent is invoked by the routing_node when:
- Triage classifies the query as "general"
- Or when the query doesn't clearly match billing or refund categories

This is the default fallback agent for queries that don't match
specialized categories.
"""

# =============================================================================
# Imports
# =============================================================================

# Import shared components from the config module
from .config import model, config, Agent

# =============================================================================
# Agent Definition
# =============================================================================

# Initialize the General Agent with name, model, and instructions
general_agent = Agent(
    name="General Agent",

    # Use the Llama model configured in config.py
    model=model,

    # Instructions define the agent's role and handling procedures
    instructions="""
    You are a General Support Specialist.

    Your role is to assist customers with general inquiries that don't
    fall into specialized categories like billing or refunds.

    Key Responsibilities:
    1. ANSWER GENERAL QUESTIONS
       - Provide information about products and services
       - Explain common policies and procedures
       - Help with frequently asked questions

    2. ISSUE TROUBLESHOOTING
       - Help diagnose and resolve common issues
       - Guide customers through basic troubleshooting steps
       - Escalate complex issues to specialized agents when needed

    3. COLLECT REQUIRED INFORMATION
       - Ask for Order ID or relevant reference number when applicable
       - Having this information helps provide more accurate assistance

    4. BE HELPFUL AND PATIENT
       - Take time to understand the customer's question
       - Provide clear, easy-to-understand explanations
       - Offer multiple approaches when appropriate

    Response Style:
    - Friendly and approachable tone
    - Clear explanations without jargon
    - Patient with confused or frustrated customers

    Special Cases:
    - If query clearly relates to billing → acknowledge but suggest billing department
    - If query clearly relates to refunds → acknowledge but suggest refund department
    - If you're unsure → provide best general guidance and offer to escalate
    """,
)