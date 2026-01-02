from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/bank_db")

def create_engine_with_retry():
    max_retries = 10
    retry_interval = 5
    
    for i in range(max_retries):
        try:
            print(f"Attempting to connect to database (Attempt {i+1}/{max_retries})...")
            engine = create_engine(DATABASE_URL)
            connection = engine.connect()
            connection.close()
            print("Database connection successful!")
            return engine
        except OperationalError as e:
            print(f"Database connection failed: {e}")
            if i < max_retries - 1:
                print(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                raise e

engine = create_engine_with_retry()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
