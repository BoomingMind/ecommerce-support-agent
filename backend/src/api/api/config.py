"""
Configuration Module
====================
This module initializes the core components needed for the LangGraph multi-agent system:
- OpenAI client (AsyncOpenAI) for making API calls
- Language model (Llama 3.3 via Groq)
- Run configuration
- AgentState TypedDict for the state graph

These components are imported by all agent modules and the main API.
"""

# =============================================================================
# External Dependencies
# =============================================================================

# Standard library modules
import os

# Third-party packages
from dotenv import load_dotenv  # Loads environment variables from .env file
from agents import Agent, OpenAIChatCompletionsModel, AsyncOpenAI, Runner, RunConfig, ModelSettings
from typing import TypedDict  # Type hints for the state dictionary

# Load environment variables from .env file
# This allows API keys and URLs to be stored securely outside the code
load_dotenv()

REQUIRED_ENV_VARS = ("GROQ_API_KEY", "GROQ_BASE_URL")
missing_env_vars = [name for name in REQUIRED_ENV_VARS if not os.getenv(name)]
if missing_env_vars:
    raise RuntimeError(
        f"Missing required environment variables: {', '.join(missing_env_vars)}"
    )

# Optional tuning knob for response length.
# If unset or invalid, we use a safe default of 128 tokens.
try:
    MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "128"))
except ValueError:
    MAX_OUTPUT_TOKENS = 128

# =============================================================================
# OpenAI Client Initialization
# =============================================================================

# Create an async OpenAI-compatible client configured for Groq API
# Groq provides fast inference for Llama and other open-source models
# The API key and base URL are read from environment variables
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),      # API key for authentication with Groq
    base_url=os.getenv("GROQ_BASE_URL")      # Base URL for the Groq API endpoint
)

# =============================================================================
# Language Model Configuration
# =============================================================================

# Initialize the Llama 3.3 70B Versatile model via OpenAIChatCompletionsModel
# This model is good for complex reasoning and following instructions
model = OpenAIChatCompletionsModel(
    openai_client=client,     # The client to use for API calls
    model="llama-3.3-70b-versatile"  # Model identifier on Groq
)

# =============================================================================
# Run Configuration
# =============================================================================

# Configure how agent runs are executed
config = RunConfig(
    model=model,                      # The model to use
    model_settings=ModelSettings(max_tokens=MAX_OUTPUT_TOKENS),  # Cap output length globally
    tracing_disabled=True             # Disable OpenAI tracing for privacy/speed
)

# =============================================================================
# Agent State Definition
# =============================================================================

# TypedDict defining the shape of data passed between nodes in the LangGraph
# This acts as a schema for the conversation state that flows through the graph
class AgentState(TypedDict):
    """
    State dictionary passed through the LangGraph workflow.

    Attributes:
        user_input: The original message from the user
        category: The query category determined by triage (billing/refund/general)
        response: The final response text from the specialist agent
    """
    user_input: str
    category: str
    response: str
    intermediate_results: dict
    final_response: str
    context: str
    conversation_history: list
    retry_count: int
    needs_retry: bool
    retrieved_products: list