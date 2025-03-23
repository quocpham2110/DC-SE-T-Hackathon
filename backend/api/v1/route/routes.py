import os
from fastapi import APIRouter, HTTPException, FastAPI, Depends
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




# define the classes for requess :

class BusTrackingRequest(BaseModel):
    trip_id: Union[str, None] = None
    vehicle_id: Union[str, None] = None

# end of the class ------------------


# helper functions :

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


@router.get("/transit/vehiclePosition")
async def get_vehicle_position():
    """Fetch real-time vehicle position updates."""
    # Load the transit data
    try:
        feed = parse_realtime_data(
            "https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions")
        vehicle_positions = []
        last_update_time = None  # Store the timestamp of the last update

        for entity in feed.entity:
            if entity.HasField('vehicle'):
                vehicle = entity.vehicle
                position_info = {
                    'vehicle_id': vehicle.vehicle.id,
                    'trip_id': vehicle.trip.trip_id,
                    'latitude': vehicle.position.latitude,
                    'longitude': vehicle.position.longitude,
                    'timestamp': vehicle.timestamp  # Add timestamp to position_info
                }

                # Check if the timestamp is different from the last update
                if position_info['timestamp'] != last_update_time:
                    vehicle_positions.append(position_info)
                    last_update_time = position_info['timestamp']
                    print(
                        f"Decoded position: {position_info['latitude']}, {position_info['longitude']}")

        return vehicle_positions
    except Exception as e:
        error_msg = f"Unexpected error in get_vehicle_position: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/transit/track-bus")
async def track_bus(request: BusTrackingRequest):
    crowd_arr = []
    try:
        feed = parse_realtime_data(
            "https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions"
        )
        if not feed:
            raise HTTPException(
                status_code=500, detail="Failed to fetch real-time data"
            )
        detail = []

        for entity in feed.entity:
            if entity.HasField('vehicle'):
                vehicle = entity.vehicle
                if vehicle.trip.trip_id == request.trip_id:
                    detail.append({
                        "trip_id": vehicle.trip.trip_id,
                        "vehicle_id": vehicle.vehicle.id,
                        "latitude": vehicle.position.latitude,
                        "longitude": vehicle.position.longitude,
                        "timestamp": vehicle.timestamp,
                    })
                    db_query = Queries()
                    shape_id = db_query.execute_query(f"""
                                    SELECT shape_id, direction_name, trip_headsign, route_id
                                    FROM trips 
                                    WHERE trip_id = '{request.trip_id}'
                                    LIMIT 1;
                                    """)
                    if shape_id:
                        shape_id_data = json.loads(shape_id)

                        if shape_id_data[0]:
                            detail[0]["direction_name"] = shape_id_data[0]['direction_name']
                            detail[0]["trip_headsign"] = shape_id_data[0]['trip_headsign']
                            detail[0]["route_id"] = shape_id_data[0]['route_id']
                        else:
                            detail[0]["direction_name"] = "Unknown"
                            detail[0]["trip_headsign"] = "Unknown"
                            detail[0]["route_id"] = "Unknown"

                        # get the shape detail
                        shape_detail = db_query.execute_query(f"""
                                    SELECT shape_pt_lat, shape_pt_lon
                                    FROM shapes
                                    WHERE shape_id = '{shape_id_data[0]['shape_id']}'
                                    order by shape_pt_sequence; """)
                        if shape_detail:
                            shape_detail_data = json.loads(shape_detail)
                            # get the stop detail
                            # print(shape_detail_data)

                            detail.append(shape_detail_data)
                    # get the crowd of the bus from passanger 😀
                    crowd = db_query.execute_query(f"""
                        select passenger_in , passenger_out from passengers where vehicle_id = '{vehicle.vehicle.id}';
                                                    """)
                    if crowd != "[]":
                        crowd_data = json.loads(crowd)
                        passanger_in = crowd_data[0]['passenger_in']
                        passanger_out = crowd_data[0]['passenger_out']
                        if passanger_in and not passanger_out:
                            # if the bus is empty
                            crowd_arr.append({"total_passenger": passanger_in})
                            # if the passanger is more
                            if passanger_in < 25:
                                crowd_arr.append({"crowd_color": "Green"})
                                crowd_arr.append({"status": True})

                            elif passanger_in < 50:
                                crowd_arr.append({"crowd_color": "Yellow"})
                                crowd_arr.append({"status": True})

                            else:
                                crowd_arr.append({"crowd_color": "Red"})
                                crowd_arr.append({"status": False})

                        elif passanger_in and passanger_out:
                            total_passenger = passanger_in - passanger_out
                            crowd_arr.append(
                                {"total_passenger": total_passenger})
                            if total_passenger < 25:
                                crowd_arr.append({"crowd_color": "Green"})

                            elif total_passenger < 50:
                                crowd_arr.append({"crowd_color": "Yellow"})

                            elif total_passenger < 60:
                                crowd_arr.append({"crowd_color": "orange"})

                            else:
                                crowd_arr.append({"crowd_color": "Red"})
                                # detail.append({"status": False})

                        else:
                            crowd_arr.append({"status": "not available"})
                            crowd_arr.append({"crowd_color": "Blue"})
                    else:
                        crowd_arr.append({"status": "not available"})
                        crowd_arr.append({"crowd_color": "Blue"})

                    print(crowd_arr)
                    detail.append({"crowd": crowd_arr})

        return detail

    except Exception as e:
        error_msg = f"Error tracking bus: {str(e)}"
        logging.error(error_msg)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)
