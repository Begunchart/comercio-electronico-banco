import sys
import os

# Add current directory to sys.path so we can import modules
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Card
from main import create_card

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def test_create_card_limit():
    db = TestingSessionLocal()
    try:
        # Mock payload
        payload = {"user_id": 123}
        
        # Call the function directly
        print("Creating card...")
        card = create_card(payload=payload, db=db)
        
        print(f"Card Created: {card.card_number}")
        print(f"Credit Limit: {card.credit_limit}")
        
        if card.credit_limit == 5000.0:
            print("SUCCESS: Credit limit is 5000.0")
        else:
            print(f"FAILURE: Credit limit is {card.credit_limit}, expected 5000.0")
            sys.exit(1)
            
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_create_card_limit()
