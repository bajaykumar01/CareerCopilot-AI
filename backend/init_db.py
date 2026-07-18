import pymysql
from urllib.parse import urlparse
import sys
import os

# Add the current folder to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.config import settings

def initialize_database():
    url = settings.DATABASE_URL
    if not url.startswith("mysql+pymysql://"):
        print("Database connection string does not use mysql+pymysql. Skipping schema creation.")
        return
        
    # Extract connection credentials from connection string
    clean_url = url.replace("mysql+pymysql://", "http://")
    parsed = urlparse(clean_url)
    username = parsed.username
    password = parsed.password or ""
    hostname = parsed.hostname
    port = parsed.port or 3306
    db_name = parsed.path.lstrip("/")
    
    print(f"Attempting connection to MySQL server at {hostname}:{port} (User: {username})...")
    try:
        connection = pymysql.connect(
            host=hostname,
            user=username,
            password=password,
            port=port
        )
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Database schema '{db_name}' confirmed/created.")
        connection.close()
    except Exception as e:
        print(f"Error auto-creating database schema: {str(e)}")
        print(f"Please ensure your database server is running and that user '{username}' can connect.")
        print(f"Manual setup: CREATE DATABASE {db_name};")

if __name__ == "__main__":
    initialize_database()
