Setup Buss Buddy
===========================

To set up Buss Buddy, follow the instructions below to ensure all necessary dependencies are installed and configured.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   setup_requirements

Setting Up the Backend
-----------------------

1. **Install Python**: Make sure you have Python 3.8 or higher installed.
2. **Install pip**: Ensure that pip is installed to manage Python packages.
3. **Install PostgreSQL**: PostgreSQL must be installed for the database setup.
4. **Install Required Python Packages**: Use the following command to install the required Python dependencies:

```
pip install -r requirements.txt
```

5. **Set Up the Database**: You must have PostgreSQL running on your system. Fill in the required database connection information in the `.env` file.
- A sample `.env` file is available in the root directory as `.env.copy`. Copy it to `.env` and fill in the necessary database information.

6. **Run the Backend Server**: Once the requirements and database are set up, start the backend server using:

```
uvicorn main:app --reload
```

- This will start the FastAPI backend server and make it available for use.

Setting Up the Frontend
------------------------

1. **Install Node.js**: Ensure that Node.js and npm (Node package manager) are installed.
2. **Install Frontend Packages**: In the frontend directory, run the following command to install the required npm packages:

```
npm install
```

3. **Run the Frontend**: Once the packages are installed, you can run the frontend application with one of the following commands:
- For development:
  ```
  npm run dev
  ```
- To build the production version:
  ```
  npm run build
  ```

After completing these steps, your Buss Buddy setup is ready!

