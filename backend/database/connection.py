import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()


class Connection:

    def __init__(self):
        self.conn = None
        self.cursor = None

    def setup_db_postgres(self):
        try:
            dbname = os.environ.get('POSTGRES_DB')
            user = os.environ.get('POSTGRES_USER')
            password = os.environ.get('POSTGRES_PASSWORD')
            host = os.environ.get('Host')
            port = os.environ.get('ports')

            # Check if any of the required environment variables are missing
            if not dbname or not user or not password or not host or not port:
                raise ValueError(
                    "One or more environment variables are missing")

            # SQLAlchemy engine connection string
            database_url = f'postgresql://{user}:{password}@{host}:{port}/{dbname}'

            # Create SQLAlchemy engine
            self.engine = create_engine(database_url)
            print("Connected to the database successfully!")
            return self.engine

        except Exception as e:
            print(f"Error connecting to the database: {e}")
            return None


if __name__ == "__main__":
    db_connection = Connection()
    engine = db_connection.setup_db_postgres()  # Get the connection
    if engine:
        print("Database connection established.")
    else:
        print("Failed to connect to the database.")
