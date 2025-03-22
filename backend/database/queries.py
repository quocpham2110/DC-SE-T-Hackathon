from database.connection import Connection
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import json


class Queries:
    def __init__(self):
        self.connection = Connection()
        self.engine = self.connection.setup_db_postgres()
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def execute_query(self, query):
        """Executes a raw SQL query."""
        try:
            result = self.session.execute(text(query))
            self.session.commit()
            rows = result.fetchall()
            columns = result.keys()
            result_as_dic = [dict(zip(columns, row)) for row in rows]

            return json.dumps(result_as_dic)

        except Exception as e:
            self.session.rollback()
            raise Exception(f"Error executing query: {e}")

    def run_query(self, query):
        """Executes a raw SQL query."""
        try:
            result = self.session.execute(text(query))
            self.session.commit()
            return result

        except Exception as e:
            self.session.rollback()
            raise Exception(f"Error executing query: {e}")

    def close_session(self):
        """Closes the session properly."""
        self.session.close()


if __name__ == "__main__":
    db_queries = Queries()
    result = db_queries.execute_query("SELECT * from trips limit 1;")
    print(result)
    db_queries.close_session()
