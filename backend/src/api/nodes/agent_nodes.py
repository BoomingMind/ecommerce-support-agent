"""
Agent Nodes Module
=================
LangGraph node functions for the Dynamic Multi-Agent System.

Architecture (team-with-manager model):
    User → triage_node → dynamic_execution_node → supervisor_node
                               ↑                        |
                               └──── retry loop ────────┘ (max 2 retries)
                                          ↓ (on success)
                                         END

Each node receives and returns an AgentState dict shared across all nodes.
The Supervisor can signal a retry by setting state["needs_retry"] = True,
which routes the graph back to dynamic_execution_node for a fresh attempt.
"""

import json
from backend.src.api.api.config import AgentState, model, config, Runner

# Specialist agents
from backend.src.api.api.triage_agent import triage_agent
from backend.src.api.api.billing_agent import billing_agent
from backend.src.api.api.refund_agent import refund_agent
from backend.src.api.api.general_agent import general_agent
from backend.src.api.api.support_agent import support_agent
from backend.src.api.api.sales_agent import sales_agent
from backend.src.api.api.context_agent import context_agent
from backend.src.api.api.router_agent import router_agent
from backend.src.api.api.supervisor_agent import supervisor_agent

MAX_RETRIES = 2  # Maximum supervisor-triggered retries before forcing a response

# =============================================================================
# Agent map — shared between nodes
# =============================================================================

AGENT_MAP = {
    "context": context_agent,
    "support":  support_agent,
    "sales":    sales_agent,
    "billing":  billing_agent,
    "refund":   refund_agent,
    "general":  general_agent,
}

# =============================================================================
# Node 1: Triage
# =============================================================================

async def triage_node(state: AgentState) -> AgentState:
    """
    Classifies the user's query into a category.
    Stored in state["category"] as a hint for the router.
    """
    try:
        result = await Runner.run(
            triage_agent,
            run_config=config,
            input=state["user_input"],
        )
        state["category"] = result.final_output.strip().lower()
    except Exception as e:
        print(f"[triage_node] Failed: {e}")
        state["category"] = "general"  # safe fallback

    return state


# =============================================================================
# Node 2: Dynamic Execution  (re-entered on retry)
# =============================================================================

async def dynamic_execution_node(state: AgentState) -> AgentState:
    """
    The core execution hub.

    Flow:
    1. Ask the Router Agent which specialists to call (returns JSON plan).
    2. Run each specialist in sequence, storing results in
       state["intermediate_results"][agent_name].
    3. Combine all results into state["response"] for the Supervisor.

    On retry: intermediate_results is cleared so stale answers don't
    pollute the new attempt.  The retry prompt includes "Please improve
    on the previous response" for better results.
    """
    retry_count = state.get("retry_count", 0)

    # Clear stale results from previous attempt
    state["intermediate_results"] = {}
    state["needs_retry"] = False

    # Build the router prompt — include retry context if this is a re-run
    router_input = state["user_input"]
    if retry_count > 0:
        prev = state.get("response", "")
        router_input = (
            f"[RETRY {retry_count}] The previous response was insufficient:\n"
            f"---\n{prev}\n---\n"
            f"Original query: {state['user_input']}\n"
            f"Please select agents to produce a better response."
        )

    try:
        # Ask the Router which agents to call
        router_result = await Runner.run(
            router_agent,
            run_config=config,
            input=router_input,
        )

        # Parse the JSON routing plan
        try:
            decision = json.loads(router_result.final_output.strip())
            agents_to_call = decision.get("agents_to_call", [])
            if not isinstance(agents_to_call, list) or not agents_to_call:
                raise ValueError("Empty or invalid agents_to_call")
        except (json.JSONDecodeError, ValueError, AttributeError):
            # Router failed to produce valid JSON — fall back to triage category
            category = state.get("category", "general")
            agents_to_call = [category if category in AGENT_MAP else "general"]
            print(f"[dynamic_execution_node] Router JSON parse failed — using fallback: {agents_to_call}")

        # Run each chosen specialist
        for agent_name in agents_to_call:
            agent = AGENT_MAP.get(agent_name)
            if agent is None:
                print(f"[dynamic_execution_node] Unknown agent '{agent_name}' — skipping")
                continue

            try:
                context_text = state["intermediate_results"].get("context", "")
                if context_text and agent_name != "context":
                    agent_input = (
                        f"User query: {state['user_input']}\n\n"
                        f"Known context:\n{context_text}"
                    )
                else:
                    agent_input = state["user_input"]

                result = await Runner.run(
                    agent,
                    run_config=config,
                    input=agent_input,
                )
                state["intermediate_results"][agent_name] = result.final_output.strip()
            except Exception as e:
                print(f"[dynamic_execution_node] Agent '{agent_name}' failed: {e}")
                state["intermediate_results"][agent_name] = ""

        # Combine all specialist responses → single response for the Supervisor
        combined = "\n\n".join(
            v for v in state["intermediate_results"].values() if v
        )
        state["response"] = combined or "I'm sorry, I was unable to process your request."

    except Exception as e:
        print(f"[dynamic_execution_node] Fatal error: {e}")
        state["response"] = "An error occurred while processing your request. Please try again."

    return state


# =============================================================================
# Node 3: Supervisor  (can trigger retry)
# =============================================================================

async def supervisor_node(state: AgentState) -> AgentState:
    """
    Quality-assurance manager node.

    Responsibilities:
    - Review the combined response from all specialist agents
    - If quality is acceptable → polish and write to state["final_response"]
    - If quality is poor AND retries remain → set state["needs_retry"] = True
      so the graph routes back to dynamic_execution_node

    The Supervisor is instructed to return one of two formats:
      APPROVE: <polished response>
      RETRY:   <reason why response is insufficient>

    This lets us programmatically detect retry vs approve without
    relying on another LLM call.
    """
    current_response = state.get("response", "")
    retry_count = state.get("retry_count", 0)

    if not current_response:
        state["final_response"] = "I'm sorry, I could not generate a response. Please try again."
        state["response"] = state["final_response"]
        state["needs_retry"] = False
        return state

    # Build the supervisor prompt
    supervisor_input = (
        f"Customer query: {state['user_input']}\n\n"
        f"Specialist response(s):\n{current_response}\n\n"
        f"Retries used so far: {retry_count} / {MAX_RETRIES}\n\n"
        "If this response fully and correctly answers the customer's query, "
        "reply with:\n  APPROVE: <polished final response>\n\n"
        "If the response is incomplete, incorrect, or unhelpful AND retries "
        "are still available, reply with:\n  RETRY: <brief reason>\n\n"
        "Important: start your reply with exactly 'APPROVE:' or 'RETRY:'"
    )

    try:
        result = await Runner.run(
            supervisor_agent,
            run_config=config,
            input=supervisor_input,
        )
        output = result.final_output.strip()

        if output.upper().startswith("RETRY:") and retry_count < MAX_RETRIES:
            # Supervisor is requesting a retry
            reason = output[len("RETRY:"):].strip()
            print(f"[supervisor_node] Retry {retry_count + 1}/{MAX_RETRIES} requested: {reason}")
            state["needs_retry"] = True
            state["retry_count"] = retry_count + 1
        else:
            # Either APPROVE or max retries reached — extract the polished text
            if output.upper().startswith("APPROVE:"):
                polished = output[len("APPROVE:"):].strip()
            else:
                # Supervisor didn't follow format — use raw output
                polished = output

            state["final_response"] = polished
            state["response"] = polished
            state["needs_retry"] = False

    except Exception as e:
        print(f"[supervisor_node] Failed: {e}")
        # On error, just pass through unpolished response
        state["final_response"] = current_response
        state["needs_retry"] = False

    return state


# =============================================================================
# Conditional Edge Function
# =============================================================================

def should_retry(state: AgentState) -> str:
    """
    Routing function for the conditional edge after supervisor_node.

    Returns:
        "retry"    → route back to dynamic_execution_node
        "end"      → route to END (response is ready)
    """
    if state.get("needs_retry", False) and state.get("retry_count", 0) <= MAX_RETRIES:
        return "retry"
    return "end"