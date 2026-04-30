# E-Commerce AI Customer Support Agent

<!-- Logo placeholder -->
<div align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/LangGraph-Workflows-FF6F00?style=for-the-badge&logo=langchain" alt="LangGraph">
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</div>

---

 An intelligent customer support system powered by multi-agent orchestration.

 Built with LangGraph, FastAPI, and React — designed to handle real-world support scenarios.

---

## Overview

This project demonstrates a **Multi-Agent AI System** where specialized agents collaborate to handle customer queries efficiently. The system uses **LangGraph** for workflow orchestration, implementing a pipeline: **Triage → Route → Execute → Validate**.

### Key Features

- **Intelligent Routing** — Queries are classified and routed to the right specialist
- **Specialized Agents** — Billing, Refund, and General support agents
- **Response Validation** — Quality assurance before final delivery
- **Streaming Responses** — Real-time, word-by-word delivery for natural feel
- **Modern UI** — Clean React frontend with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Orchestration** | LangGraph |
| **Backend** | FastAPI, Python |
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS, ShadCN UI |
| **Icons** | Lucide React |
| **LLM Provider** | Groq (Llama 3.3) |

---

---

## Architecture

```
User Query
    │
    ▼
┌─────────────┐
│    Triage   │  ← Classifies query (billing / refund / general)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Routing   │  ← Routes to appropriate specialist agent
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Specialist │  ← Billing / Refund / General Agent
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validation  │  ← Quality check and response improvement
└──────┬──────┘
       │
       ▼
   Final Response
```

### Workflow Graph
![Agent Workflow Graph](backend/graphs/agent_graph.png)

---

## Project Structure

```
Customer_Support_Representative/
├── backend/
│   └── src/
│       ├── api/
│       │   ├── main.py                 # FastAPI entry point + SSE streaming
│       │   ├── api/
│       │   │   ├── config.py           # Model & RunConfig
│       │   │   ├── triage_agent.py     # Query classification
│       │   │   ├── billing_agent.py    # Billing specialist
│       │   │   ├── refund_agent.py     # Refund specialist
│       │   │   ├── general_agent.py    # General support
│       │   │   └── validator.py        # Response QA
│       │   └── nodes/
│       │       └── agent_nodes.py  # LangGraph node definitions
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main chat interface
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx     # Scrollable message history
│   │   │   ├── MessageBubble.jsx  # User/AI message bubbles
│   │   │   ├── InputBox.jsx       # Message input
│   │   │   ├── AgentStatus.jsx     # Active agent indicator
│   │   │   └── ui/
│   │   │       ├── button.jsx
│   │   │       └── input.jsx
│   │   ├── lib/
│   │   │   └── utils.js           # cn() utility
│   │   └── index.css              # Tailwind imports
│   ├── index.html
│   └── package.json
│
├── .env                           # API keys
└── requirements.txt               # Python dependencies
```

---

## Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- Groq API key

### Backend Setup

```bash
# Navigate to project root
cd Customer_Support_Representative

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Setup

Create a `.env` file in the project root with your Groq credentials:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

> Get your Groq API key from [console.groq.com](https://console.groq.com/keys)

---

## How to Run

### Start Backend

```bash
# From project root, with venv activated
python -m uvicorn backend.src.api.main:app --reload
```

Or using uvicorn directly if installed in your path:

```bash
uvicorn backend.src.api.main:app --reload --port 8000
```

Backend runs at: `http://127.0.0.1:8000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/query` | Non-streaming query (returns complete response) |
| `GET` | `/api/stream?query=<text>` | SSE streaming (recommended) |

### Example Request

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a refund for order #12345"}'
```

---

## Usage

1. Start the backend server
2. Start the frontend dev server
3. Open `http://localhost:5173` in your browser
4. Type your query in the chat box
5. Watch the agent status indicator as it processes your query

### Try These Queries

- **Refund:** "I accidentally paid twice for my order. Order #000001. How do I get a refund?"
- **Billing:** "Can you explain the charge on my latest invoice?"
- **General:** "What are your shipping options?"

---

## Agents

| Agent | Purpose |
|-------|---------|
| **Triage** | Classifies incoming queries |
| **Billing** | Handles payment and invoice questions |
| **Refund** | Processes refund requests |
| **General** | Handles general inquiries |
| **Validator** | Quality-checks final responses |

---

## Future Improvements

- [ ] Conversation history and context
- [ ] More specialized agents (Shipping, Returns, Technical)
- [ ] User authentication
- [ ] Database integration for order lookup
- [ ] WebSocket support for bidirectional streaming
- [ ] Admin dashboard for analytics

---

## License

MIT License

---

*Built by Syed Sarim Abbas*
