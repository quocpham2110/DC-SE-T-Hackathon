# database Postgres
# can use render database freetire :)
from dotenv import load_dotenv
from connection import Connection
from sqlalchemy import text

load_dotenv()


class DbSetup:
    def __init__(self, engine):
        """Initialize DbSetup with a database engine."""
        self.engine = engine

    def create_tables(self):
        """Creates tables with relationships in the database."""
        create_table_query = """
        
                            CREATE EXTENSION IF NOT EXISTS postgis;
                            CREATE EXTENSION IF NOT EXISTS pgrouting;

                            CREATE TABLE IF NOT EXISTS agency (
                                agency_id TEXT PRIMARY KEY,
                                agency_name TEXT NOT NULL,
                                agency_url TEXT NOT NULL,
                                agency_timezone TEXT NOT NULL,
                                agency_lang TEXT,
                                agency_phone TEXT,
                                agency_fare_url TEXT,
                                agency_email TEXT
                            );

                            CREATE TABLE IF NOT EXISTS calendar_dates (
                                service_id TEXT NOT NULL,
                                date DATE NOT NULL,
                                exception_type INTEGER NOT NULL,
                                PRIMARY KEY (service_id, date)
                            );

                            CREATE TABLE IF NOT EXISTS calendar (
                                service_id TEXT PRIMARY KEY,
                                monday INTEGER NOT NULL,
                                tuesday INTEGER NOT NULL,
                                wednesday INTEGER NOT NULL,
                                thursday INTEGER NOT NULL,
                                friday INTEGER NOT NULL,
                                saturday INTEGER NOT NULL,
                                sunday INTEGER NOT NULL,
                                start_date DATE NOT NULL,
                                end_date DATE NOT NULL
                            );

                            CREATE TABLE IF NOT EXISTS fare_attributes (
                                fare_id TEXT PRIMARY KEY,
                                price NUMERIC NOT NULL,
                                currency_type TEXT NOT NULL,
                                payment_method INTEGER NOT NULL,
                                transfers INTEGER,  -- Allow NULL values
                                transfer_duration INTEGER
                            );

                            CREATE TABLE IF NOT EXISTS feed_info (
                                feed_publisher_name TEXT NOT NULL,
                                feed_publisher_url TEXT NOT NULL,
                                feed_lang TEXT NOT NULL,
                                feed_start_date DATE,
                                feed_end_date DATE
                            );

                            CREATE TABLE IF NOT EXISTS routes (
                                route_id TEXT PRIMARY KEY,
                                agency_id TEXT,  -- Allow NULL for single-agency feeds
                                route_short_name TEXT,  -- Allow NULL if route_long_name exists
                                route_long_name TEXT,   -- Allow NULL if route_short_name exists
                                route_desc TEXT,
                                route_type INTEGER NOT NULL,
                                route_url TEXT,
                                route_color TEXT,  -- Allow NULL and any length
                                route_text_color TEXT   -- Allow NULL and any length
                            );

                            CREATE TABLE IF NOT EXISTS shapes (
                                shape_id TEXT NOT NULL,
                                shape_pt_lat DOUBLE PRECISION NOT NULL,
                                shape_pt_lon DOUBLE PRECISION NOT NULL,
                                shape_pt_sequence INTEGER NOT NULL,
                                shape_dist_traveled DOUBLE PRECISION,  -- Allow NULL
                                PRIMARY KEY (shape_id, shape_pt_sequence)
                            );

                            CREATE TABLE IF NOT EXISTS stops (
                                stop_id TEXT PRIMARY KEY,
                                stop_code TEXT,
                                stop_name TEXT NOT NULL,
                                stop_desc TEXT,
                                stop_lat DOUBLE PRECISION NOT NULL,
                                stop_lon DOUBLE PRECISION NOT NULL,
                                zone_id TEXT,
                                stop_url TEXT,
                                location_type INTEGER,  -- Allow NULL (defaults to 0)
                                parent_station TEXT,    -- Allow NULL
                                stop_timezone TEXT,     -- Allow NULL
                                wheelchair_boarding INTEGER,  -- Allow NULL
                                preferred INTEGER,           -- Allow NULL
                                geom GEOMETRY(Point, 4326)   -- PostGIS geometry
                            );

                            CREATE TABLE IF NOT EXISTS stop_times (
                                trip_id TEXT NOT NULL,
                                arrival_time TEXT NOT NULL,  -- Using TEXT for times outside 24hr range
                                departure_time TEXT NOT NULL, -- Using TEXT for times outside 24hr range
                                stop_id TEXT NOT NULL,
                                stop_sequence INTEGER NOT NULL,
                                stop_headsign TEXT,
                                pickup_type INTEGER,  -- Allow NULL (defaults to 0)
                                drop_off_type INTEGER, -- Allow NULL (defaults to 0)
                                shape_dist_traveled DOUBLE PRECISION, -- Allow NULL
                                timepoint INTEGER,    -- Allow NULL (defaults to 1)
                                PRIMARY KEY (trip_id, stop_sequence)
                            );

                            CREATE TABLE IF NOT EXISTS trips (
                                route_id TEXT NOT NULL,
                                service_id TEXT NOT NULL,
                                trip_id TEXT PRIMARY KEY,
                                trip_headsign TEXT,
                                direction_id INTEGER, -- Allow NULL 
                                block_id TEXT,        -- Allow NULL
                                shape_id TEXT,        -- Allow NULL
                                direction_name TEXT,  -- Allow NULL
                                wheelchair_accessible INTEGER -- Allow NULL (defaults to 0)
                            );
                            
                            
                            CREATE TABLE IF NOT EXISTS passengers (
                            id SERIAL PRIMARY KEY,
                            vehicle_id CHAR(50),
                            passenger_in INT,
                            passenger_out INT,
                            timestamp TIMESTAMP WITHOUT TIME ZONE,
                            status BOOLEAN
                            );
                            
                            ALTER TABLE stops
                            ADD COLUMN IF NOT EXISTS geom GEOMETRY(Point, 4326);
                            
                            ALTER TABLE passengers
                            ADD CONSTRAINT unique_vehicle_id UNIQUE (vehicle_id);

                            
                            UPDATE stops
                            SET geom = ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)
                            WHERE stop_lat IS NOT NULL AND stop_lon IS NOT NULL;
                            
                            
                            -- indexing for faster : 
                            CREATE INDEX IF NOT EXISTS stops_geom_idx ON stops USING GIST (geom);
                            
                            """
        try:
            with self.engine.connect() as connection:
                connection.execute(text(create_table_query))
                connection.commit()
                print("Tables created successfully.")
        except Exception as e:
            print(f"Error creating tables: {e}")


if __name__ == "__main__":
    db_connection = Connection()
    engine = db_connection.setup_db_postgres()  # Get the connection
    if engine:
        db_setup = DbSetup(engine)
        db_setup.create_tables()  # Create tables if connected
