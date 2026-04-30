import httpx
import os

async def fetch_mockapi_products():
    """Fetches clothing data from the MockAPI endpoint."""
    url = os.getenv("MOCK_API")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching products: {e}")
            return []