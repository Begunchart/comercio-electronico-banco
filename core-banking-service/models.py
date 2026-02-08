from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) 
    account_number = Column(String, unique=True, index=True) # Checkings Account Number
    balance = Column(Float, default=0.0)

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    card_number = Column(String, unique=True, index=True)
    expiry = Column(String)
    cvv = Column(String)
    credit_limit = Column(Float, default=5000.0)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount = Column(Float)
    transaction_type = Column(String) # 'create', 'transfer_in', 'transfer_out', 'purchase'
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    related_account_id = Column(Integer, nullable=True) # If transfer, who was other party?

class Beneficiary(Base):
    __tablename__ = "beneficiaries_v2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Who owns this contact
    name = Column(String)
    account_number = Column(String)
    alias = Column(String, nullable=True)
    bank_name = Column(String, default="CreditBank")
    cedula = Column(String, nullable=True)
    phone = Column(String, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String)
    message = Column(String)
    is_read = Column(Integer, default=0) # 0 = unread, 1 = read
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
