"""
Customer Support Agent API - FastAPI Backend
=============================================
Multi-agent customer support system with LangGraph orchestration.

Pipeline:
    triage_node → dynamic_execution_node → supervisor_node → END

Endpoints:
    POST /api/query          — Complete JSON response
    GET  /api/stream?query=  — SSE word-by-word streaming
    GET  /api/agents         — Agent manifest for frontend UI
"""

from backend.src.api.api.config import AgentState
from backend.src.api.nodes.agent_nodes import (
    triage_node,
    dynamic_execution_node,
    supervisor_node,
    should_retry,
)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
import asyncio
import json
import random
import logging
import os

# =============================================================================
# FastAPI App Setup
# =============================================================================

app = FastAPI(
    title="Customer Support Agent",
    description="Multi-agent customer support system with LangGraph orchestration",
)

logger = logging.getLogger(__name__)

# Enable CORS with explicit allowlist
# Why: frontend runs in a separate origin during development and deployment.
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Agent manifest for frontend UI cards / status legends.
# Why: keeps frontend labels aligned with backend capabilities in one place.
AGENT_MANIFEST = [
    {
        "id": "triage",
        "name": "Triage Agent",
        "role": "Classifier",
        "description": "Classifies the user query into a high-level category.",
    },
    {
        "id": "router",
        "name": "Router Agent",
        "role": "Planner",
        "description": "Selects which specialist agents should handle the query.",
    },
    {
        "id": "context",
        "name": "Context Agent",
        "role": "Context Builder",
        "description": "Summarizes prior context for better downstream responses.",
    },
    {
        "id": "support",
        "name": "Support Agent",
        "role": "Specialist",
        "description": "Handles complaints and general support/service issues.",
    },
    {
        "id": "sales",
        "name": "Sales Agent",
        "role": "Specialist",
        "description": "Handles product, purchasing, and offer-related questions.",
    },
    {
        "id": "billing",
        "name": "Billing Agent",
        "role": "Specialist",
        "description": "Handles invoice, charge, and payment-related questions.",
    },
    {
        "id": "refund",
        "name": "Refund Agent",
        "role": "Specialist",
        "description": "Handles refund requests and refund policy questions.",
    },
    {
        "id": "supervisor",
        "name": "Supervisor Agent",
        "role": "Quality Controller",
        "description": "Approves a final answer or requests a retry when needed.",
    },
]

# =============================================================================
# Request / Response Models
# =============================================================================

class QueryRequest(BaseModel):
    """Request model for the /api/query endpoint."""
    query: str

# =============================================================================
# LangGraph Workflow Setup
# =============================================================================

# Build the state graph
builder = StateGraph(AgentState)

# Register every node on the builder (NOT on graph — graph doesn't exist yet)
builder.add_node("triage",     triage_node)              # Step 1: classify query
builder.add_node("execution",  dynamic_execution_node)   # Step 2: run specialist agents
builder.add_node("supervisor", supervisor_node)          # Step 3: QA / polish response

# Wire the edges
builder.set_entry_point("triage")
builder.add_edge("triage",     "execution")
builder.add_edge("execution",  "supervisor")
builder.add_conditional_edges(
    "supervisor",
    should_retry,
    {
        "retry": "execution",
        "end": END,
    },
)

# Compile — creates the runnable `graph` object
graph = builder.compile()

# =============================================================================
# Helper Functions
# =============================================================================

def get_typing_delay() -> float:
    """Random 20–70 ms delay to simulate human typing speed."""
    return random.uniform(0.02, 0.07)


def build_initial_state(user_input: str) -> AgentState:
    """Create a fully-initialized graph state."""
    return {
        "user_input": user_input,
        "category": "",
        "response": "",
        "intermediate_results": {},
        "final_response": "",
        "context": "",
        "conversation_history": [],
        "retry_count": 0,
        "needs_retry": False,
    }


async def generate_streaming_response(query: str):
    """
    Async generator that runs the full agent pipeline and streams
    the final response word-by-word in SSE format.

    SSE event types:
    - meta  -> initial metadata, includes category
    - chunk -> incremental response text
    - done  -> final completion signal
    - error -> sanitized server error
    """
    try:
        # Short-circuit exit commands
        if query.lower().strip() in ["exit", "bye", "good day", "good bye"]:
            # Keep shape simple for frontend parser.
            yield f"data: {json.dumps({'type': 'done', 'chunk': 'Thank you for using our service. Goodbye!', 'done': True})}\n\n"
            return

        # Run the full LangGraph pipeline
        result = await graph.ainvoke(build_initial_state(query))

        # Read from response (supervisor writes back here)
        response_text = result.get("response", "") or result.get("final_response", "No response generated.")
        category = result.get("category", "general")

        # Emit metadata first for frontend status updates
        yield f"data: {json.dumps({'type': 'meta', 'category': category})}\n\n"

        # Stream word-by-word
        words = response_text.split()
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'type': 'chunk', 'chunk': chunk, 'done': False})}\n\n"
            await asyncio.sleep(get_typing_delay())

        # Signal completion
        yield f"data: {json.dumps({'type': 'done', 'chunk': '', 'done': True})}\n\n"

    except Exception:
        logger.exception("streaming pipeline failed")
        yield f"data: {json.dumps({'type': 'error', 'message': 'Internal server error', 'chunk': '', 'done': True, 'error': True})}\n\n"

# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/api/agents")
async def get_agent_manifest():
    """
    Returns a frontend-friendly manifest of active agents.
    Why: frontend can render agent cards and labels from backend truth.
    """
    return {"agents": AGENT_MANIFEST}


@app.post("/api/query")
async def handle_query(request: QueryRequest):
    """
    Non-streaming endpoint — returns the complete response as JSON.
    Useful for simple integrations or testing.
    """
    try:
        if request.query.lower().strip() in ["exit", "bye", "good day", "good bye"]:
            return {
                "response": "Thank you for using our service. Goodbye!",
                "category": "general",
                "status":   "complete",
            }

        result = await graph.ainvoke(build_initial_state(request.query))

        return {
            "response": result.get("response", "") or result.get("final_response", "No response generated."),
            "category": result.get("category", "unknown"),
            "status":   "complete",
        }
    except Exception:
        logger.exception("handle_query failed")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/stream")
async def stream_query(query: str):
    """
    SSE streaming endpoint — streams the response word-by-word in real time.
    Recommended for the React frontend.
    """
    return StreamingResponse(
        generate_streaming_response(query),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "Connection":       "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)