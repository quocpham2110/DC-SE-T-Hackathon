Stack Used
===========

This section outlines the technologies and tools used in the Bus Buddy project.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   fastapi
   redis
   react
   open_data
   protobuffer
   rate_limiter
   yolo
   tailwind
   openstreetmap
   gtfs_static_data
   postgres_sql

Technologies Used
-----------------

### FastAPI
- **Description**: FastAPI is used as the backend framework for creating APIs quickly and efficiently. It offers support for modern Python features like type hints and asynchronous processing.
- **Use**: All backend services and API endpoints are built using FastAPI.

### Redis
- **Description**: Redis is used for caching and storing temporary data.
- **Use**: Helps improve performance by caching frequently accessed data, reducing the load on the database.

### React
- **Description**: React is used for building the user interface of the web application.
- **Use**: The frontend is built using React for a responsive and dynamic user experience.

### Open Data
- **Description**: Open Data refers to publicly available datasets that provide useful information such as real-time transit data, bus routes, and more.
- **Use**: Utilized for fetching transit data in real-time and enriching the application's functionality.

### Protocol Buffers (Protobuf)
- **Description**: Protocol Buffers are used for serializing structured data, especially in cases of inter-service communication.
- **Use**: Protobuf helps in efficient and compact data transfer between services.

### Rate Limiter
- **Description**: A rate limiter is used to restrict the number of requests that can be made to the API within a certain time frame.
- **Use**: Prevents abuse and ensures fair use of API resources.

### YOLO (You Only Look Once)
- **Description**: YOLO is a real-time object detection system.
- **Use**: Used for detecting buses and other objects from live video feeds or images, providing real-time tracking and analysis.

### Tailwind CSS
- **Description**: Tailwind CSS is a utility-first CSS framework.
- **Use**: Used for styling the frontend with customizable classes to build a visually appealing UI without writing custom CSS from scratch.

### OpenStreetMap (OSM)
- **Description**: OpenStreetMap is a free map data provider.
- **Use**: Integrated to provide interactive maps for displaying bus locations and routes.

### GTFS Static Data
- **Description**: GTFS (General Transit Feed Specification) static data provides information about bus schedules, routes, and other transit information.
- **Use**: Used to generate the schedules and route details in the application.

### PostgreSQL
- **Description**: PostgreSQL is a relational database management system.
- **Use**: Used for storing and querying data such as user information, bus details, and transit updates in a structured way.

