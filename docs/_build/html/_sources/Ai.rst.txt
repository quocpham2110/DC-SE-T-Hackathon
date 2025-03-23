AI Implementation
===========================

This section explains the AI implementation used in the Bus Buddy project, focusing on the use of YOLOv8 and YOLOv11 for detecting buses and passengers.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   yolo_v8_v11
   server_updater
   tracker

AI Overview
-----------

The system uses YOLO (You Only Look Once) versions 8 and 11 for real-time object detection. These models are used to detect buses and passengers, specifically identifying the "first door" and "second door" areas on the bus. The AI operates asynchronously using multi-threading to ensure smooth performance even under heavy traffic conditions, such as the demands from Durham Region's public transit system.

### YOLOv8 and YOLOv11
- **Purpose**: Detect buses and passengers in real-time using object detection algorithms.
- **Functionality**: The AI models are trained to recognize different objects, including the first and second doors of a bus and passengers. These models are essential for crowd detection, which is a key feature of the project.
- **Data for AI**:
  - `vehicle_id`: The ID of the vehicle (string), used for associating detections with a specific bus.
  - **API Key**: An API key is required for securing access to the system and ensuring only authorized requests are processed.

### Asynchronous Processing and Multi-Threading
- The system is designed to handle high server load efficiently. The detection process is handled asynchronously, using multi-threading to process the data in parallel without causing delays.
- Data is cached and sent to the database every 15 seconds, reducing the load on the server while still providing real-time updates.

### Data Storage and Cleanup
- **Database Storage**: The analysis results are stored in the `passengers` table in the database. The data is used to generate real-time statistics about passengers and bus occupancy.
- **Data Reset**: To prevent data conflicts and ensure daily accuracy, the database is cleared every day at 12 PM. This ensures fresh data each day, avoiding the accumulation of outdated information.
- **Optional Data Retention**: The data can be saved for future analysis if needed, providing a historical record of passenger counts and vehicle locations.

Files Overview
--------------

### `server_updater.py`
- **Purpose**: Manages the process of sending requests to the server and updating the data.
- **Functionality**: Sends the detected passenger and vehicle data to the server with the required headers. This script is responsible for keeping the server updated with real-time information.

### `tracker.py`
- **Purpose**: Tracks the bus and passengers, and monitors YOLO's operation.
- **Functionality**: This script tracks the buses and detects passengers, generating a CSV file with the data and the timestamps of each detection. The CSV file helps keep a record of detections over time.
- **Training YOLO**: While there wasn't enough time to implement a full training process with multiple test cases, YOLO is already performing well with good accuracy. The system is capable of improving over time as more data becomes available.

