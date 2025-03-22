from dbsetup import DbSetup
from connection import Connection
import pandas as pd
import os


class LoadGtfs:
    def __init__(self, path, filename):
        self.path = path
        self.filename = filename
        self.engine = None

    def connect_to_db(self, engine):
        """Establish a connection to the PostgreSQL database."""
        try:
            self.engine = engine
            print("Connected to the database successfully.")
        except Exception as e:
            print(f"Error connecting to database: {e}")

    def import_gtfs_to_db(self, filename, tablename):
        """Read GTFS file and load data into the database."""
        file_path = os.path.join(self.path, filename)
        normalized_path = os.path.normpath(file_path)
        print(normalized_path)
        try:
            # Read the GTFS file (assumed to be a CSV file)
            data = pd.read_csv(normalized_path)
            # Insert the data into the table
            data.to_sql(tablename, self.engine,
                        if_exists='replace', index=False)
            print(
                f"Data from {filename} loaded into {tablename} successfully.")
        except Exception as e:
            print(f"Error loading GTFS data to {tablename}: {e}")


if __name__ == "__main__":
    # Get database connection first
    connection = Connection()
    engine = connection.setup_db_postgres()

    if not engine:
        print("Failed to connect to database")
        exit(1)

    # Create tables using DbSetup
    db_setup = DbSetup(engine)
    db_setup.create_tables()

    filename = ["agency", "calendar_dates", "calendar", "fare_attributes",
                "feed_info", "routes", "shapes", "stop_times", "stops", "trips"]

    for file in filename:
        gtfs_files = LoadGtfs("../gtfs", f"{file}.txt")
        gtfs_files.connect_to_db(engine)  # Pass the engine
        gtfs_files.import_gtfs_to_db(f"{file}.txt", file)
