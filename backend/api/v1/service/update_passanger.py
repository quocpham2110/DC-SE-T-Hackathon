from google.transit import gtfs_realtime_pb2
import requests
from fastapi import APIRouter, HTTPException, Header, Depends, FastAPI
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from database.queries import Queries
from fastapi.responses import JSONResponse
from datetime import datetime
import redis.asyncio as redis
from contextlib import asynccontextmanager

from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

# load limiter


@asynccontextmanager
async def lifespan(_: FastAPI):
    redis_connection = redis.from_url(
        "redis://localhost:6379", encoding="utf8")
    await FastAPILimiter.init(redis_connection)
    yield
    await FastAPILimiter.close()

load_dotenv()

update_passanger = APIRouter(lifespan=lifespan)


# define the classes for requess :


class Driver_status(BaseModel):
    vehicle_id: str
    status: bool


class PassengerUpdate(BaseModel):
    vehicle_id: str
    passenger_in: int
    passenger_out: int
    timestamp: datetime


API_KEY = os.environ.get("API_KEY")


# end of the class ------------------


# helper functions :6104

def verify_api_key(api_key: str = Header(...)):
    API_KEY = os.environ.get("API_KEY")
    if api_key != API_KEY:
        return False
    return True


def parse_realtime_data(filelink):
    """Parses a GTFS Realtime data file."""
    feed = gtfs_realtime_pb2.FeedMessage()
    try:
        response = requests.get(filelink)
        response.raise_for_status()  # Raise an exception for bad status codes
        feed.ParseFromString(response.content)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching or parsing real-time data: {e}")
        # Handle the error appropriately (e.g., return an error message)
        return None
    return feed

# end of the helper functions ------------------


@update_passanger.post("/update_passengers")
async def Update_passangers(data: PassengerUpdate, _=Depends(verify_api_key)):
    """Fetch real-time transit trip updates."""

    # Fetch real-time vehicle data
    feed = parse_realtime_data(
        "https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions"
    )

    if not feed:
        raise HTTPException(
            status_code=500, detail="Failed to fetch real-time data"
        )

    for entity in feed.entity:
        vehicle = entity.vehicle
        # Correctly accessing vehicle ID
        if hasattr(vehicle, "vehicle") and data.vehicle_id == vehicle.vehicle.id:
            db_query = Queries()

            # Insert or Update passenger_in count
            if data.passenger_in:
                db_query.run_query(f"""
                        INSERT INTO passengers ( vehicle_id, passenger_in, timestamp)
                        VALUES ('{data.vehicle_id}',  {data.passenger_in}, '{data.timestamp}')
                        ON CONFLICT (vehicle_id)
                        DO UPDATE SET 
                            passenger_in = COALESCE(passengers.passenger_in, 0) + {data.passenger_in},
                            timestamp = '{data.timestamp}';
                    """)
                return {"message": "Passenger count updated successfully for passenger_in"}

            # Insert or Update passenger_out count
            elif data.passenger_out:
                db_query.run_query(f"""
                        INSERT INTO passengers ( vehicle_id,  passenger_out, timestamp)
                        VALUES ( '{data.vehicle_id}',  {data.passenger_out}, '{data.timestamp}')
                        ON CONFLICT (vehicle_id)
                        DO UPDATE SET 
                            passenger_out = COALESCE(passengers.passenger_out, 0) + {data.passenger_out},
                            timestamp = '{data.timestamp}';
                    """)
                return {"message": "Passenger count updated successfully for passenger_out"}

    raise HTTPException(status_code=404, detail="Vehicle not found")


@update_passanger.post("/update_Status", dependencies=[Depends(RateLimiter(times=2, seconds=5))])
async def Update_status(data: Driver_status, _=Depends(verify_api_key)):
    """Update bus status—this will be handled by the driver."""

    feed = parse_realtime_data(
        "https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions"
    )
    if not feed:
        raise HTTPException(
            status_code=500, detail="Failed to fetch real-time data")

    db_query = Queries()
    vehicle_found = False

    for entity in feed.entity:
        vehicle = entity.vehicle

        # Correctly accessing vehicle ID
        if hasattr(vehicle, "vehicle") and data.vehicle_id == vehicle.vehicle.id:
            vehicle_found = True
            # # Use parameterized query to prevent SQL injection
            db_query.run_query(
                f"""
                INSERT INTO passengers (vehicle_id, status)
                VALUES ('{data.vehicle_id}', {data.status})
                ON CONFLICT (vehicle_id)
                DO UPDATE SET status = EXCLUDED.status;
                """)

            return JSONResponse(content={"message": "Bus status updated successfully"}, status_code=200)

    # Only return "not found" after checking all vehicles
    if not vehicle_found:
        return JSONResponse(content={"message": "Vehicle not found"}, status_code=404)
