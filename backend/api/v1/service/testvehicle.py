import json
import requests
from fastapi import HTTPException
from google.transit import gtfs_realtime_pb2
from google.protobuf.json_format import MessageToDict


def parse_realtime_data(url):
    response = requests.get(url)
    if response.status_code != 200:
        return None
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    return feed


def save_to_json(data, filename="realtime_data.json"):
    with open(filename, "w") as json_file:
        json.dump(data, json_file, indent=4)


feed = parse_realtime_data(
    "https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions"
)
if not feed:
    raise HTTPException(status_code=500, detail="Failed to fetch real-time data")

# Convert entire feed to dictionary and save
feed_dict = MessageToDict(feed)
save_to_json(feed_dict)
