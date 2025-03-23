import cv2
from tracker import ObjectCounter
import asyncio
import redis
import json
import time

from server_updater import ServerUpdater

# Initialize Redis connection
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Initialize ServerUpdater with API details
updater = ServerUpdater(
    vehicle_id="7102",
    server_url="http://localhost:8000/api/v1/passanger/update_passengers",
    api_key="6D35E7F352B61BB52C2B359AF1BC1884D6E20E771721E581A8B4958FA740D35F"
)

# Configuration
UPDATE_INTERVAL = 15  # Seconds between database updates
CACHE_KEY = "passenger_counts:6102:917"  # Redis key for storing counts

# Define the mouse callback function


def RGB(event, x, y, flags, param):
    if event == cv2.EVENT_MOUSEMOVE:
        print(f"Mouse moved to: {[x, y]}")

# Function to check if a point crosses the line


def crosses_line(prev_point, current_point, line_start, line_end):
    if prev_point[0] < line_start[0] and current_point[0] >= line_start[0]:
        return "IN"
    elif prev_point[0] > line_end[0] and current_point[0] <= line_end[0]:
        return "OUT"
    return None

# Cache management functions


def initialize_cache():
    """Initialize the Redis cache with default values"""
    default_data = {
        "in_count": 0,
        "out_count": 0,
        "last_update_time": time.time(),
        "pending_updates": False
    }
    redis_client.set(CACHE_KEY, json.dumps(default_data))
    return default_data


def get_cache_data():
    """Get current cache data or initialize if not exists"""
    cache_data = redis_client.get(CACHE_KEY)
    if cache_data:
        return json.loads(cache_data)
    return initialize_cache()


def update_cache(in_increment=0, out_increment=0):
    """Update the cache with new counts"""
    cache_data = get_cache_data()

    if in_increment > 0 or out_increment > 0:
        cache_data["in_count"] += in_increment
        cache_data["out_count"] += out_increment
        cache_data["pending_updates"] = True

    redis_client.set(CACHE_KEY, json.dumps(cache_data))
    return cache_data


async def sync_with_server():
    """Periodically sync cache data with the server every 15 seconds, independent of video status."""
    while True:
        await asyncio.sleep(UPDATE_INTERVAL)  # Wait 15 seconds

        cache_data = get_cache_data()

        if cache_data["in_count"] > 0 or cache_data["out_count"] > 0:
            # Send update to the server
            await updater.update_counts(
                in_increment=cache_data["in_count"],
                out_increment=cache_data["out_count"]
            )

            # Reset the counts after syncing
            cache_data["in_count"] = 0
            cache_data["out_count"] = 0
            cache_data["last_update_time"] = time.time()
            cache_data["pending_updates"] = False

            redis_client.set(CACHE_KEY, json.dumps(cache_data))

            print(
                f"Database updated and reset: IN={cache_data['in_count']}, OUT={cache_data['out_count']}")


async def process_video():
    """Process video frames and count passengers"""
    # Open the video file
    cap = cv2.VideoCapture(0)

    # Define region points for counting at the first bus door
    region_points_first_door = [(100, 50), (200, 400)]

    # Initialize the object counter for the first bus door
    counter_first_door = ObjectCounter(
        region=region_points_first_door,
        model="yolov8s.pt",
        classes=[0],  # Detect only person class
        show_in=True,
        show_out=True,
        line_width=2,
        confidence_threshold=0.5
    )

    # Create a named window and set the mouse callback
    cv2.namedWindow('RGB')
    cv2.setMouseCallback('RGB', RGB)

    # Define the line for counting
    line_start = (450, 500)
    line_end = (150, 400)

    count = 0

    # Initialize the cache
    initialize_cache()

    while True:
        # Process video in chunks to allow other async tasks to run
        for _ in range(10):  # Process 10 frames before yielding
            ret, frame = cap.read()
            if not ret:
                cap.release()
                cv2.destroyAllWindows()
                return  # Exit the function when video ends

            count += 1
            if count % 2 == 0:  # Process every second frame
                continue

            frame = cv2.resize(frame, (1020, 500))

            # Draw the counting line
            cv2.line(frame, line_start, line_end, (0, 255, 0), 2)

            # Process the frame with the object counter
            frame = counter_first_door.count(frame)

            # Check for line crossing and update counts
            in_increment = 0
            out_increment = 0

            for track_id in counter_first_door.track_ids:
                if track_id in counter_first_door.track_history:
                    history = counter_first_door.track_history[track_id]
                    if len(history) > 1:
                        prev_position = history[-2]
                        current_position = history[-1]
                        action = crosses_line(
                            prev_position, current_position, line_start, line_end)

                        if action == "IN":
                            in_increment += 1
                        elif action == "OUT":
                            out_increment += 1

            # Update the cache if we detected any movements
            if in_increment > 0 or out_increment > 0:
                update_cache(in_increment, out_increment)

            # Get latest counts from cache for display
            cache_data = get_cache_data()

            # Display the counts on the frame
            cv2.putText(frame, f'IN: {cache_data["in_count"]}', (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f'OUT: {cache_data["out_count"]}', (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            # Add sync status indicator
            last_update = int(time.time() - cache_data["last_update_time"])
            status = f"Last sync: {last_update}s ago"
            cv2.putText(frame, status, (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            # Show the frame
            cv2.imshow("RGB", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                cap.release()
                cv2.destroyAllWindows()
                return  # Exit the function when user presses 'q'

        # Yield to other tasks after processing a batch of frames
        await asyncio.sleep(0.01)


async def main():
    # Run both tasks concurrently
    await asyncio.gather(
        sync_with_server(),
        process_video()
    )

# Run the async function properly
if __name__ == "__main__":
    asyncio.run(main())
