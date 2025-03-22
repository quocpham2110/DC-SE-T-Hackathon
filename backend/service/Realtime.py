from google.transit import gtfs_realtime_pb2
import requests
from google.protobuf.json_format import MessageToDict
import logging
import os
from dotenv import load_dotenv
import json
load_dotenv()

logger = logging.getLogger(__name__)

# Configure basic logging if not already configured elsewhere.
if not logger.hasHandlers():
    logging.basicConfig(level=logging.INFO)


class Realtime:
    def __init__(self, url):
        self.url = url
        self.timeout = 10

    def gtfs_realtime(self):
        """
        Fetches GTFS Realtime data from the specified URL and returns it as a dictionary.
        Handles network errors, timeouts, and parsing issues gracefully.
        """
        try:
            # Log fetching attempt
            logger.info(f"Fetching GTFS Realtime data from URL: {self.url}")
            response = requests.get(
                self.url, allow_redirects=True, timeout=self.timeout)
            response.raise_for_status()

            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            # Debug log for success
            logger.debug("Successfully parsed GTFS Realtime data.")
            return MessageToDict(feed)

        except requests.exceptions.Timeout as e:
            error_message = f"Request to {self.url} timed out after {self.timeout} seconds: {e}"
            # Log as warning - timeout might be transient
            logger.warning(error_message)
            return None

        except requests.exceptions.RequestException as e:
            error_message = f"Request to {self.url} failed due to a network error: {e}"
            # Log as error - more serious network issue
            logger.error(error_message)
            return None

        except Exception as e:
            error_message = f"Error parsing GTFS Realtime data from {self.url}: {e}"
            # Log full exception traceback for parsing errors
            logger.exception(error_message)
            return None


# testing
if __name__ == '__main__':
    trip_updates_url = os.environ.get("VehiclePositions")
    if not trip_updates_url:
        print("Error: TripUpdates URL not found in environment variables. Please set TripUpdates in your .env file.")
    else:
        realtime_fetcher = Realtime(trip_updates_url)
        realtime_data = realtime_fetcher.gtfs_realtime()

        if realtime_data:
            print("Successfully fetched and parsed GTFS Realtime data:")
            print(json.dumps(realtime_data, indent=2))
            entity_count = len(realtime_data.get('entity', []))
            print(f"Number of entities in the feed: {entity_count}")
            if entity_count > 0:
                print(
                    f"First entity (example): {realtime_data['entity'][0].keys()}")
        else:
            print("Failed to fetch or parse GTFS Realtime data. Check logs for details.")
