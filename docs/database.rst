Database Structure
=================

This section outlines the structure of the database and the associated files used for interacting with the database.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   connection
   dbsetup
   load_gtfs
   queries

Files Overview
--------------

### `connection.py`
- **Purpose**: Establishes a secure connection to the database.
- **Details**: 
  - `connection.py` handles the connection setup by reading the necessary credentials from `.env` files for security.
  - The required data for setting up the connection:
    1. **Database Name**: Name of the database to connect to.
    2. **User Name**: Username for authenticating the connection.
    3. **Password**: Password for the user.
    4. **Host**: The host (IP or domain) where the database is located.
    5. **Port**: Port number for connecting to the database.
  
- **Security**: The connection details, including credentials, are stored in a `.env` file for improved security and confidentiality. This file is never committed to version control.

### `dbsetup.py`
- **Purpose**: Sets up the database and creates necessary tables.
- **Details**: 
  - This script is used to initialize the database by creating the required tables and structures based on the application’s needs.
  - Tables are created for storing user information, transit data, bus schedules, and other required data related to the application.
  - It ensures that all tables and their relationships are set up correctly in accordance with the application's functionality.

### `load_gtfs.py`
- **Purpose**: Loads GTFS (General Transit Feed Specification) data into the database.
- **Details**:
  - This script fetches GTFS data from the `gtfs` folder and imports it into the database.
  - It reads various GTFS files such as routes, trips, stops, and schedules, and inserts the data into the relevant database tables.
  - Useful for keeping the database up-to-date with the latest transit data.

### `queries.py`
- **Purpose**: Executes database queries and retrieves data.
- **Details**:
  - This script is responsible for executing queries against the database to retrieve specific data.
  - It supports various types of queries, such as fetching transit trip updates, passenger data, vehicle positions, and other relevant information.
  - It abstracts database operations, providing easy-to-use functions for interacting with the database.

