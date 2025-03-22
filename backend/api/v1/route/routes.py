import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from service.Realtime import Realtime
from database.queries import Queries

from typing import Union
from google.transit import gtfs_realtime_pb2
import requests
import logging
import json

load_dotenv()

router = APIRouter()


@router.get("/transit/trips")
async def get_transit_trips():
    """Fetch real-time transit trip updates."""
    # Load the transit data
    url = os.environ.get("TripUpdates")  # Use environment variable for URL
    if not url:
        raise HTTPException(
            status_code=500, detail="GTFS Realtime URL not configured in environment variables (TripUpdates)")
    realtime_fetcher = Realtime(url)
    data = realtime_fetcher.gtfs_realtime()
    db_queries = Queries()

    try:
        entity = data["entity"]
        for el in entity:
            tripId = el["tripUpdate"]["trip"]["tripId"]

            query = f"SELECT direction_name, trip_headsign FROM trips WHERE trip_id = '{tripId}';"
            result = db_queries.execute_query(query)
            result = json.loads(result)
            if len(result) == 1:
                el["direction_name"] = result[0]["direction_name"]
                el["trip_headsign"] = result[0]["trip_headsign"]
            else:
                el["direction_name"] = "Unknown"
                el["trip_headsign"] = "Unknown"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db_queries.close_session()

    return data
