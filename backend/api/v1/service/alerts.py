import json
from google.protobuf.json_format import MessageToJson
from google.transit import gtfs_realtime_pb2
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
import os
load_dotenv()

alert = APIRouter()


def parse_realtime_data(filelink):
    """Parses a GTFS Realtime data file from a URL."""
    feed = gtfs_realtime_pb2.FeedMessage()

    try:
        response = requests.get(filelink)
        response.raise_for_status()
        feed.ParseFromString(response.content)
    except requests.exceptions.RequestException as e:
        print(f"HTTP request error: {e}")
        return None
    except Exception as e:
        print(f"Error parsing GTFS Realtime data: {e}")
        return None

    return feed


@alert.get("/alerts")
async def get_alerts():
    """Fetches GTFS Realtime alerts and returns only the alert message text."""
    url = os.environ.get("Alerts")
    if not url:
        raise HTTPException(
            status_code=500, detail="GTFS Realtime URL not configured in environment variables (Alerts)"
        )

    feed = parse_realtime_data(url)
    if feed is None:
        raise HTTPException(
            status_code=500, detail="Failed to fetch or parse GTFS Realtime data"
        )

    messages = []  # List to store alert messages

    for entity in feed.entity:
        if entity.HasField("alert"):
            alert_json = json.loads(MessageToJson(entity.alert))

            # Extract description text
            if "descriptionText" in alert_json and "translation" in alert_json["descriptionText"]:
                for translation in alert_json["descriptionText"]["translation"]:
                    if translation.get("language") == "en":  # Filter English messages
                        messages.append(translation["text"])

    return {"alerts": messages}
