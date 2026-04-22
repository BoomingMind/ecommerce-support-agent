"""
Customer Support Agent API - FastAPI Backend
=============================================
This module provides the API endpoints for the multi-agent customer support system.
The system uses LangGraph for agent orchestration with the following flow:
    1. Triage Agent - classifies the user query
    2. Routing Agent - routes to the appropriate specialist agent
    3. Validation Agent - validates and improves the response

Endpoints:
    POST /api/query - Send a query and get a complete response
    GET /api/stream/{query} - SSE stream for real-time response streaming
"""

from backend.src.api.api.config import AgentState, model, config, Runner
from backend.src.api.api.billing_agent import billing_agent
from backend.src.api.api.refund_agent import refund_agent
from backend.src.api.api.general_agent import general_agent
from backend.src.api.api.validator import validation_node
from backend.src.api.nodes.agent_nodes import triage_node, routing_node
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from grandalf.graphs import Graph
import asyncio
import json
import random

# =============================================================================
# FastAPI App Setup
# =============================================================================

app = FastAPI(
    title="Customer Support Agent",
    description="Multi-agent customer support system with LangGraph orchestration"
)

# Enable CORS for all origins to allow frontend access
# In production, restrict this to your specific frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Request/Response Models
# =============================================================================

class QueryRequest(BaseModel):
    """Request model for the /api/query endpoint"""
    query: str

# =============================================================================
# LangGraph Workflow Setup
# =============================================================================

# Initialize the state graph for agent orchestration
builder = StateGraph(AgentState)

# Add nodes for each stage of the workflow
builder.add_node("triage", triage_node)        # Classify user query
builder.add_node("routing", routing_node)      # Route to appropriate agent
builder.add_node("validation", validation_node) # Validate and improve response

# Define the workflow edges
builder.set_entry_point("triage")              # Start with triage
builder.add_edge("triage", "routing")          # Triage -> Routing
builder.add_edge("routing", "validation")      # Routing -> Validation
builder.add_edge("validation", END)            # Validation is final step

# Compile the graph for execution
graph = builder.compile()

# =============================================================================
# Helper Functions
# =============================================================================

def get_typing_delay():
    """
    Returns a random delay to simulate human typing speed.
    Ranges from 20ms to 70ms per word for a natural, conversational feel.
    Faster typing suggests familiarity, slower suggests thoughtfulness.
    """
    return random.uniform(0.02, 0.07)

async def generate_streaming_response(query: str):
    """
    Generates a streaming response for the given query.

    This async generator:
    1. Runs the query through the LangGraph workflow
    2. Yields the response word-by-word with natural typing delays

    Args:
        query: The user's input query

    Yields:
        SSE-formatted strings with response chunks
    """
    try:
        # Check for exit commands - respond and close stream
        if query.lower().strip() in ["exit", "bye", "good day", "good bye"]:
            yield f"data: {json.dumps({'chunk': 'Thank you for using our service. Goodbye!', 'done': True})}\n\n"
            return

        # Invoke the LangGraph workflow to get the complete response
        initial_state = {"user_input": query}
        result = await graph.ainvoke(initial_state)

        # Extract the response text from the workflow result
        response_text = result.get("response", "No response generated")

        # Stream the response word-by-word with human-like delays
        # This creates the feeling of a thoughtful, real conversation
        words = response_text.split()
        for i, word in enumerate(words):
            # Add space after word (except for the last word)
            chunk = word + (" " if i < len(words) - 1 else "")

            # Yield the chunk wrapped in SSE format
            yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"

            # Random delay between 20-70ms to simulate natural typing
            await asyncio.sleep(get_typing_delay())

        # Send completion signal to indicate stream is finished
        yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"

    except Exception as e:
        # Stream error message and signal completion
        error_msg = f"An error occurred: {str(e)}"
        yield f"data: {json.dumps({'chunk': error_msg, 'done': True, 'error': True})}\n\n"

# =============================================================================
# API Endpoints
# =============================================================================

@app.post("/api/query")
async def handle_query(request: QueryRequest):
    """
    Non-streaming endpoint for queries.

    Processes the query through the full agent workflow and returns
    the complete response at once. Use this for simple integrations
    where real-time streaming is not needed.

    Args:
        request: QueryRequest containing the user's query

    Returns:
        JSON object with response, category, and status
    """
    try:
        if request.query.lower() in ["exit", "bye", "good day", "good bye"]:
            return {
                "response": "Thank you for using our service. Goodbye!",
                "category": "general",
                "status": "complete"
            }

        initial_state = {"user_input": request.query}
        result = await graph.ainvoke(initial_state)

        return {
            "response": result.get("response", "No response generated"),
            "category": result.get("category", "unknown"),
            "status": "complete"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stream/{query}")
async def stream_query(query: str):
    """
    Streaming endpoint using Server-Sent Events (SSE).

    Streams the response in real-time, word-by-word, to create
    an engaging experience that feels like chatting with a real
    support agent who is actively thinking and typing.

    Args:
        query: URL-encoded user query string

    Returns:
        StreamingResponse with text/event-stream media type
    """
    return StreamingResponse(
        generate_streaming_response(query),
        media_type="text/event-stream",
        headers={
            # Disable caching to ensure fresh responses
            "Cache-Control": "no-cache",
            # Keep connection alive for the duration of the stream
            "Connection": "keep-alive",
            # Disable nginx buffering if running behind a proxy
            "X-Accel-Buffering": "no"
        }
    )

# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)