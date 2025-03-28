API Docs
===========================

This documentation provides details on the various endpoints available in the Bus Buddy API, which offers real-time transit tracking and updates.

.. toctree::
   :maxdepth: 2
   :caption: Contents:
   
   introduction
   api_overview
   endpoints

Introduction
------------

The Bus Buddy API allows users to track buses in real-time, update vehicle statuses, and receive alerts for transit-related events. Below is the API specification and detailed documentation for its endpoints.

API Overview
------------

- **Version**: 0.1.0
- **Base URL**: `/api/v1/`
- **Authentication**: Some endpoints require an API key in the header.

Endpoints
---------

### `/`

- **GET**: Read the root of the API.
- **Summary**: Returns a simple root response.
- **Response**:
  - `200`: Successful response (empty JSON object).

### `/api/v1/transit/trips`

- **GET**: Get Transit Trips.
- **Description**: Fetch real-time transit trip updates.
- **Response**:
  - `200`: Successful response (empty JSON object).

### `/api/v1/transit/vehiclePosition`

- **GET**: Get Vehicle Position.
- **Description**: Fetch real-time vehicle position updates.
- **Response**:
  - `200`: Successful response (empty JSON object).

### `/api/v1/transit/track-bus`

- **POST**: Track Bus.
- **Description**: Track a specific bus using its trip and vehicle IDs.
- **Request Body**: 
  - JSON object with `trip_id` and `vehicle_id` (optional).
- **Response**:
  - `200`: Successful response (empty JSON object).
  - `422`: Validation error with error details.

### `/api/v1/alerts/alerts`

- **GET**: Get Alerts.
- **Description**: Fetch GTFS Realtime alerts.
- **Response**:
  - `200`: Successful response (empty JSON object).

### `/api/v1/passenger/update_passengers`

- **POST**: Update Passengers.
- **Description**: Update the number of passengers on a specific bus.
- **Request Body**: 
  - JSON object with `vehicle_id`, `passenger_in`, `passenger_out`, and `timestamp`.
- **Response**:
  - `200`: Successful response (empty JSON object).
  - `422`: Validation error with error details.

### `/api/v1/passenger/update_Status`

- **POST**: Update Status.
- **Description**: Update bus status. This will be handled by the driver.
- **Request Body**: 
  - JSON object with `vehicle_id` and `status`.
- **Response**:
  - `200`: Successful response (empty JSON object).
  - `422`: Validation error with error details.

Schemas
-------

### `BusTrackingRequest`

- **Properties**:
  - `trip_id` (string|null)
  - `vehicle_id` (string|null)
- **Description**: Request body for tracking a bus.

### `Driver_status`

- **Properties**:
  - `vehicle_id` (string): The ID of the vehicle.
  - `status` (boolean): The status of the vehicle.
- **Required**: `vehicle_id`, `status`
- **Description**: Request body for updating the bus status.

### `HTTPValidationError`

- **Properties**:
  - `detail` (array): A list of validation errors.
- **Description**: Represents a validation error response.

### `PassengerUpdate`

- **Properties**:
  - `vehicle_id` (string): The ID of the vehicle.
  - `passenger_in` (integer): Number of passengers entering.
  - `passenger_out` (integer): Number of passengers exiting.
  - `timestamp` (string, date-time): The timestamp of the update.
- **Required**: `vehicle_id`, `passenger_in`, `passenger_out`, `timestamp`
- **Description**: Request body for updating passenger counts.

### `ValidationError`

- **Properties**:
  - `loc` (array): The location of the error.
  - `msg` (string): The error message.
  - `type` (string): The type of error.
- **Required**: `loc`, `msg`, `type`
- **Description**: Represents an individual validation error.
