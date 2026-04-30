const DEFAULT_API_URL = "http://127.0.0.1:8000";

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (!configured || typeof configured !== "string") {
    return DEFAULT_API_URL;
  }

  const trimmed = configured.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_API_URL;
}

export async function fetchAgentManifest() {
  const response = await fetch(`${getApiBaseUrl()}/api/agents`);
  if (!response.ok) {
    throw new Error("Could not fetch agent list.");
  }

  const data = await response.json();
  return Array.isArray(data?.agents) ? data.agents : [];
}
