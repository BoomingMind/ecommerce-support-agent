"""
Agent Nodes Module
=================
LangGraph node functions that define the workflow of the multi-agent system.

Each function in this module represents a node in the LangGraph state graph.
These nodes are called in sequence to process a user query:
1. triage_node - Classify the query
2. routing_node - Select and invoke the appropriate specialist agent

The nodes receive and modify the AgentState, which passes data between nodes.
"""

# =============================================================================
# Imports
# =============================================================================

# Import shared components from the config module
from backend.src.api.api.config import AgentState, model, config, Runner

# Import all the specialist agents
from backend.src.api.api.triage_agent import triage_agent
from backend.src.api.api.billing_agent import billing_agent
from backend.src.api.api.refund_agent import refund_agent
from backend.src.api.api.general_agent import general_agent

# =============================================================================
# LangGraph Node Functions
# =============================================================================

async def triage_node(state: AgentState):
    """
    Triage Node - Classifies the user's query into a category.

    This is the entry point of the LangGraph workflow.
    It receives the user's input and runs it through the Triage Agent
    to determine which specialist should handle the query.

    Args:
        state: AgentState containing user_input (the user's query)

    Returns:
        Updated state with category field populated

    Process:
        1. Extract user_input from state
        2. Run the triage_agent with the user input
        3. Get the category result (billing/refund/general)
        4. Store the category in state
        5. Return updated state to the graph
    """
    # Run the triage agent on the user's input
    # Runner.run is the standard way to invoke agents in the agents library
    result = await Runner.run(
        triage_agent,
        run_config=config,
        input=state["user_input"]
    )

    # Extract the category from the agent's response
    # .strip() removes leading/trailing whitespace
    # .lower() normalizes to lowercase for consistent matching
    state["category"] = result.final_output.strip().lower()

    return state


async def routing_node(state: AgentState):
    """
    Routing Node - Selects and invokes the appropriate specialist agent.

    This node examines the category from triage and selects the matching
    specialist agent to handle the query. The selected agent generates
    the actual response to the user.

    Args:
        state: AgentState containing:
            - user_input: The original user query
            - category: The category determined by triage

    Returns:
        Updated state with response field populated

    Routing Logic:
        - "billing" in category → billing_agent
        - "refund" in category → refund_agent
        - Otherwise → general_agent (default fallback)

    Process:
        1. Read the category from state
        2. Select the appropriate specialist agent
        3. Run the specialist agent on the user input
        4. Store the agent's response in state
        5. Return updated state to continue in graph
    """
    # Read the category determined by triage
    category = state["category"]

    # Select the specialist agent based on category
    # Using simple keyword matching for robustness
    if "billing" in category:
        agent = billing_agent
    elif "refund" in category:
        agent = refund_agent
    else:
        # Default to general agent for any unrecognized category
        agent = general_agent

    # Run the selected specialist agent
    result = await Runner.run(
        agent,
        run_config=config,
        input=state["user_input"]
    )

    # Store the specialist's response
    # .strip() removes any extra whitespace from the response
    state["response"] = result.final_output.strip()

    return state