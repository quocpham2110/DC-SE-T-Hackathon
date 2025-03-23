import httpx
import asyncio
from datetime import datetime, timezone
import json


class ServerUpdater:
    def __init__(self, vehicle_id, server_url, api_key):
        self.vehicle_id = vehicle_id
        self.server_url = server_url
        self.api_key = api_key
        self.passenger_in = 0
        self.passenger_out = 0

    async def send_update_to_server(self):
        async with httpx.AsyncClient() as client:
            try:
                current_time = datetime.now(
                    timezone.utc).isoformat().replace("+00:00", "Z")
                payload = {
                    "vehicle_id": self.vehicle_id,
                    "passenger_in": self.passenger_in,
                    "passenger_out": self.passenger_out,
                    "timestamp": current_time
                }

                print(f"Sending request to {self.server_url}")
                print(
                    f"Headers: {json.dumps({'api-key': self.api_key, 'Content-Type': 'application/json'}, indent=2)}")
                print(f"Payload: {json.dumps(payload, indent=2)}")

                response = await client.post(
                    self.server_url,
                    headers={
                        "api-key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                print(f"Response Status: {response.status_code}")
                print(f"Response Body: {response.text}")
                response.raise_for_status()

            except httpx.HTTPStatusError as e:
                print(f"HTTP error occurred: {e}")
            except Exception as e:
                print(f"An error occurred: {e}")

    async def update_counts(self, in_increment=0, out_increment=0):
        """
        Update passenger counts and send to server

        Args:
            in_increment (int): Number of passengers entering
            out_increment (int): Number of passengers exiting
        """
        self.passenger_in += in_increment
        self.passenger_out += out_increment

        # Send update to server
        await self.send_update_to_server()


if __name__ == "__main__":
    # Example usage
    vehicle_id = "12345"
    server_url = "http://example.com/api/v1/update_passengers"
    api_key = "your_api_key_here"
    updater = ServerUpdater(vehicle_id, server_url, api_key)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(updater.update_counts(
        in_increment=5, out_increment=2))
    loop.close()
