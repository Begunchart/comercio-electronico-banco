from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Account, Card, Transaction, Beneficiary, Notification
from pydantic import BaseModel
import jwt
import random
import datetime
from typing import Optional, List

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransferRequest(BaseModel):
    to_account_number: str
    beneficiary_cedula: str
    beneficiary_phone: str
    amount: float
    description: Optional[str] = "Transferencia"
    beneficiary_name: Optional[str] = None

class BeneficiaryCreate(BaseModel):
    name: str
    account_number: str
    alias: Optional[str] = None
    cedula: Optional[str] = None
    phone: Optional[str] = None

class BeneficiaryResponse(BaseModel):
    id: int
    name: str
    account_number: str
    alias: Optional[str] = None
    bank_name: str
    cedula: Optional[str] = None
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    timestamp: datetime.datetime
    is_read: int

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    amount: float
    transaction_type: str
    description: str
    timestamp: datetime.datetime
    
    class Config:
        from_attributes = True

class MintRequest(BaseModel):
    account_number: str
    amount: float

class AccountResponse(BaseModel):
    id: int
    user_id: int
    account_number: str
    balance: float

    class Config:
        from_attributes = True

class CardResponse(BaseModel):
    card_number: str
    expiry: str
    cvv: str
    
    class Config:
        from_attributes = True

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

def get_current_user_payload(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Token")

@app.post("/accounts", response_model=AccountResponse)
def create_account(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    # Check if exists
    db_account = db.query(Account).filter(Account.user_id == user_id).first()
    if db_account:
        return db_account
    
    # Generate Unique Account Number (10 digits)
    while True:
        acc_num = str(random.randint(1000000000, 9999999999))
        if not db.query(Account).filter(Account.account_number == acc_num).first():
            break

    new_account = Account(user_id=user_id, account_number=acc_num, balance=0.0)
    db.add(new_account)
    
    db.commit()
    db.refresh(new_account)
    return new_account

@app.post("/cards", response_model=CardResponse)
def create_card(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    
    # Generate Unique Mastercard
    while True:
        # Debit Mastercard range
        part1 = 5200 + random.randint(0, 99) 
        part2 = random.randint(1000, 9999)
        part3 = random.randint(1000, 9999)
        part4 = random.randint(1000, 9999)
        card_num = f"{part1} {part2} {part3} {part4}"
        
        if not db.query(Card).filter(Card.card_number == card_num).first():
             break
    
    month = f"{random.randint(1,12):02d}"
    year = (datetime.datetime.now().year + 5) % 100
    expiry = f"{month}/{year}"
    cvv = f"{random.randint(100,999)}"

    new_card = Card(user_id=user_id, card_number=card_num, expiry=expiry, cvv=cvv)
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card

@app.get("/cards/me", response_model=list[CardResponse])
def get_my_cards(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    cards = db.query(Card).filter(Card.user_id == user_id).all()
    return cards

@app.get("/accounts/me", response_model=AccountResponse)
def get_my_account(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    account = db.query(Account).filter(Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@app.get("/movements", response_model=List[TransactionResponse])
def get_movements(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    # Get all transactions where user_id is the owner
    txs = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.timestamp.desc()).all()
    return txs

@app.get("/beneficiaries", response_model=List[BeneficiaryResponse])
def get_beneficiaries(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    return db.query(Beneficiary).filter(Beneficiary.user_id == user_id).all()

@app.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.timestamp.desc()).all()
    return notifs

@app.put("/notifications/read-all")
def mark_all_read(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == 0).update({"is_read": 1})
    db.commit()
    return {"message": "Marked all as read"}

@app.post("/beneficiaries", response_model=BeneficiaryResponse)
def add_beneficiary(req: BeneficiaryCreate, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    # Verify account number logic? For now, trust input or we'd need a lookup endpoint.
    # We can check if account exists in OUR bank.
    # If account_number is from our bank
    dest_acc = db.query(Account).filter(Account.account_number == req.account_number).first()
    bank_name = "CreditBank" if dest_acc else "Banco Externo" # Simplified logic

    new_ben = Beneficiary(
        user_id=user_id, 
        name=req.name, 
        account_number=req.account_number, 
        alias=req.alias, 
        bank_name=bank_name,
        cedula=req.cedula,
        phone=req.phone
    )
    db.add(new_ben)
    db.commit()
    db.refresh(new_ben)
    return new_ben

@app.post("/transfer")
def transfer(req: TransferRequest, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    from_user_id = payload.get("user_id")
    
    # 1. Get Sender Account
    from_account = db.query(Account).filter(Account.user_id == from_user_id).first()
    if not from_account:
         raise HTTPException(status_code=404, detail="Origin account not found")
    
    # 2. Get Receiver Account
    to_account = db.query(Account).filter(Account.account_number == req.to_account_number).first()
    if not to_account:
        raise HTTPException(status_code=404, detail="Destination account not found")
        
    # 3. Check Funds
    if from_account.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    # 4. Execute Transfer
    from_account.balance -= req.amount
    to_account.balance += req.amount
    
    # 5. Log Transactions (One for Sender, One for Receiver)
    # Sender Log
    tx_out = Transaction(
        user_id=from_user_id,
        amount=-req.amount,
        transaction_type="transfer_out",
        description=f"Transfer to {req.to_account_number} - {req.description}",
        related_account_id=to_account.id # Internal ID tracking
    )
    
    # Receiver Log
    tx_in = Transaction(
        user_id=to_account.user_id,
        amount=req.amount,
        transaction_type="transfer_in",
        description=f"Received from {from_account.account_number} - {req.description}",
        related_account_id=from_account.id
    )
    
    db.add(tx_out)
    db.add(tx_in)
    
    # Create Notification for Receiver
    notif = Notification(
        user_id=to_account.user_id,
        title="Transferencia Recibida",
        message=f"Has recibido ${req.amount} de la cuenta {from_account.account_number}.",
        is_read=0
    )
    db.add(notif)
    
    db.commit()
    return {"message": "Transfer successful", "new_balance": from_account.balance}

# CRITICAL ENDPOINT: MONEY PRINTER
@app.post("/admin/mint-money")
def mint_money(req: MintRequest, payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    role = payload.get("role")
    # For testing: Allow 'client' to mint money too
    if role not in ["teller", "admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    account = db.query(Account).filter(Account.account_number == req.account_number).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.balance += req.amount
    
    # Log Minting
    tx_mint = Transaction(
        user_id=account.user_id,
        amount=req.amount,
        transaction_type="deposit",
        description="Deposit at Branch (Mint)",
    )
    db.add(tx_mint)
    
    db.commit()
    db.refresh(account)
    return {"message": "Money printed successfully", "new_balance": account.balance}
