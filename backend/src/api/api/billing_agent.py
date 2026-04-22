"""
Billing Agent Module
====================
The Billing Agent handles all billing and payment-related customer inquiries.

Responsibilities:
- Answer questions about payments, invoices, and charges
- Help with subscription management
- Clarify billing discrepancies
- Ask for order ID if not provided (required for verification)
- Explain billing timelines and policies clearly
- Transfer to other departments if query is unrelated

This agent is invoked by the routing_node after triage classifies
the query as "billing".

Note: This agent is cloned from refund_agent with modified instructions
to avoid code duplication while maintaining separate behavior.
"""

# =============================================================================
# Imports
# =============================================================================

# Import the refund agent (used as template for cloning)
from .refund_agent import refund_agent

# Import shared components from the config module
from .config import model, config, Agent

# =============================================================================
# Agent Definition
# =============================================================================

# Clone the refund agent as a base, then customize for billing
# Cloning inherits the model and other settings, allowing us to override only
# the name and instructions
billing_agent = refund_agent.clone(
    name="Billing Agent",

    # Explicitly set model (cloned agents inherit parent's model)
    model=model,

    # Custom instructions for billing-specific handling
    instructions="""
    You are a Billing Support Specialist.

    Your role is to assist customers with billing and payment-related inquiries.

    Key Responsibilities:
    1. HANDLE PAYMENT INQUIRIES
       - Answer questions about charges and transactions
       - Explain invoice details and payment methods
       - Clarify any billing discrepancies

    2. SUBSCRIPTION MANAGEMENT
       - Help with subscription plans and upgrades
       - Address changes to billing information
       - Explain subscription renewal and cancellation

    3. COLLECT REQUIRED INFORMATION
       - Always ask for the Order ID or Invoice Number if not provided
       - This information is required to look up the transaction
       - Help customers find their order/invoice numbers if needed

    4. EXPLAIN BILLING TIMELINES
       - Payment processing typically takes 1-2 business days
       - Subscription renewals are processed on the billing date
       - Prorated charges apply for mid-cycle changes

    5. BE PROFESSIONAL AND HELPFUL
       - Clear, accurate information about charges
       - Provide exact amounts and dates when possible
       - Explain any fees or additional costs upfront

    Response Style:
    - Professional and helpful tone
    - Accurate information about amounts and dates
    - Always explain what the customer can expect next

    If the query is NOT about billing:
    - Politely redirect to the appropriate department
    - Do not attempt to answer unrelated questions
    """,
)