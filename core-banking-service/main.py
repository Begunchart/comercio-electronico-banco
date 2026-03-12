from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Account, Card, Transaction, Beneficiary, Notification
from pydantic import BaseModel
import jwt
import random
import datetime
import os
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

class ExternalTransferRequest(BaseModel):
    amount: float
    target_account_number: str
    external_bank_name: str
    external_card_number: str
    description: Optional[str] = "Transferencia Externa"

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
    credit_limit: float
    
    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    card_number: str
    expiry: str
    cvv: str
    amount: float
    description: Optional[str] = "Purchase"
    destination_account: str
    bank_identifier: Optional[str] = None # Added for external bank routing

class VerifyCardRequest(BaseModel):
    card_number: str
    expiry_date: str
    cvv: str
    amount: float
    description: Optional[str] = "Cobro externo"

# JWT Configuration - Use environment variable in production!
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
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

    new_card = Card(user_id=user_id, card_number=card_num, expiry=expiry, cvv=cvv, credit_limit=5000.0)
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

@app.post("/external/transfer-in")
def external_transfer_in(req: ExternalTransferRequest, db: Session = Depends(get_db)):
    # Note: Depending on security requirements, this endpoint might need its own
    # specific authentication for external banks (e.g., API keys).
    # Currently, it is unprotected to serve as a proof-of-concept webhook for interbank transfers.
    
    # 1. Get Receiver Account
    to_account = db.query(Account).filter(Account.account_number == req.target_account_number).first()
    if not to_account:
        raise HTTPException(status_code=404, detail="Destination account not found")
        
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid transfer amount")
        
    # 2. Execute Transfer (Deposit)
    to_account.balance += req.amount
    
    # 3. Log Transaction for Receiver
    tx_in = Transaction(
        user_id=to_account.user_id,
        amount=req.amount,
        transaction_type="transfer_in",
        description=f"Received from {req.external_bank_name} (Card {req.external_card_number[-4:]}) - {req.description}",
        related_account_id=None # External, so no internal account ID
    )
    db.add(tx_in)
    
    # 4. Create Notification for Receiver
    notif = Notification(
        user_id=to_account.user_id,
        title="Transferencia Externa Recibida",
        message=f"Has recibido ${req.amount} desde {req.external_bank_name}.",
        is_read=0
    )
    db.add(notif)
    
    db.commit()
    
    # Security: Do NOT return the new balance to the external bank
    return {
        "message": "Transfer received successfully",
        "status": "completed",
        "transaction_id": tx_in.id
    }


@app.post("/payments/card")
def card_payment(req: PaymentRequest, db: Session = Depends(get_db)):
    import requests # Required for external API calls
    
    # 1. Check Destination Account (Must belong to OUR bank)
    dest_account = db.query(Account).filter(Account.account_number == req.destination_account).first()
    if not dest_account:
        raise HTTPException(status_code=404, detail="Destination account not found in our bank")

    # 2. Check if Card belongs to OUR bank
    # Assuming our cards always start with 5200 for internal checks, 
    # but the reliable way is to query our DB.
    card = db.query(Card).filter(
        Card.card_number == req.card_number,
        Card.expiry == req.expiry,
        Card.cvv == req.cvv
    ).first()
    
    if card:
        # --- INTERNAL CARD FLOW ---
        if card.credit_limit < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient credit limit")
        
        # Debitar Tarjeta Interna
        card.credit_limit -= req.amount
        
        # Acreditar Cuenta Destino
        dest_account.balance += req.amount

        # Log Transactions
        tx_out = Transaction(
            user_id=card.user_id,
            amount=-req.amount,
            transaction_type="purchase",
            description=f"Payment to {req.destination_account}: {req.description}",
            timestamp=datetime.datetime.utcnow(),
            related_account_id=dest_account.id
        )
        db.add(tx_out)

        tx_in = Transaction(
            user_id=dest_account.user_id,
            amount=req.amount,
            transaction_type="transfer_in",
            description=f"Received from Credit Card: {req.description}",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(tx_in)
        
        notif = Notification(
            user_id=dest_account.user_id,
            title="Pago Recibido",
            message=f"Has recibido ${req.amount} de tarjeta de crédito interna.",
            is_read=0
        )
        db.add(notif)
        
        db.commit()
        db.refresh(card)
        
        return {
            "message": "Payment successful (Internal)",
            "new_limit": card.credit_limit,
            "transaction_id": tx_out.id
        }
    else:
        # --- EXTERNAL CARD FLOW ---
        # Card not found in our DB -> It belongs to another bank.
        # We need to call the external bank's API to charge it.
        
        # Try first bank (CreditBank)
        external_api_url_1 = "http://3.144.142.161/api/transactions/simulate/"
        payload_1 = {
            "button_bank_external": True,
            "bank_identifier": "creditbank",
            "card_number": req.card_number,
            "expiry_date": req.expiry,
            "cvv": req.cvv,
            "amount": req.amount,
            "description": req.description
        }

        # Try second bank (Banco Bsidiana)
        external_api_url_2 = "https://bancobsidiana.up.railway.app/api/v1/transaction/process"
        payload_2 = {
            "card_number": req.card_number,
            "expiry": req.expiry,
            "cvv": req.cvv,
            "amount": float(req.amount),
            "merchant_id": "ciens-mart", # Adjust as needed
            "description": req.description 
        }

        try:
            # --- INTENTO 1: API de CreditBank ---
            response_1 = requests.post(external_api_url_1, json=payload_1, headers={"Content-Type": "application/json"}, timeout=10)
            
            print("=== RESPUESTA DE LA API DEL BANCO EXTERNO 1 ===")
            print(f"URL: {external_api_url_1}")
            print(f"Status Code: {response_1.status_code}")
            print(f"Cuerpo: {response_1.text}")
            print("=============================================")
            
            # If bank 1 approves
            if response_1.status_code == 200 and response_1.json().get("success") is True:
                dest_account.balance += req.amount
                tx_in = Transaction(
                    user_id=dest_account.user_id,
                    amount=req.amount,
                    transaction_type="transfer_in",
                    description=f"Received from External Card ({req.card_number[-4:]}): {req.description}",
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(tx_in)
                notif = Notification(user_id=dest_account.user_id, title="Pago Externo Recibido", message=f"Has recibido ${req.amount} desde una tarjeta externa.", is_read=0)
                db.add(notif)
                db.commit()
                return {"message": "Payment successful via Bank 1", "transaction_id": tx_in.id}

            # --- INTENTO 2: API de Banco Bsidiana ---
            # Si el banco 1 falla, salta aquí
            response_2 = requests.post(external_api_url_2, json=payload_2, headers={"Content-Type": "application/json"}, timeout=10)
            
            print("=== RESPUESTA DE LA API DEL BANCO EXTERNO 2 ===")
            print(f"URL: {external_api_url_2}")
            print(f"Status Code: {response_2.status_code}")
            print(f"Cuerpo: {response_2.text}")
            print("=============================================")
            
            # If bank 2 approves
            if response_2.status_code == 200 and response_2.json().get("status") == "APPROVED":
                dest_account.balance += req.amount
                tx_in = Transaction(
                    user_id=dest_account.user_id,
                    amount=req.amount,
                    transaction_type="transfer_in",
                    description=f"Received from External Card ({req.card_number[-4:]}): {req.description} (Bank 2)",
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(tx_in)
                notif = Notification(user_id=dest_account.user_id, title="Pago Externo Recibido", message=f"Has recibido ${req.amount} desde una tarjeta externa (Bank 2).", is_read=0)
                db.add(notif)
                db.commit()
                return {"message": "Payment successful via Bank 2", "transaction_id": tx_in.id}
            
            # Si ambos bancos fallaron
            raise HTTPException(status_code=400, detail="Transaction rejected by all external banks")

        except requests.exceptions.RequestException as e:
            print(f"Failed to reach external banks: {e}")
            raise HTTPException(status_code=502, detail="External banks timeout or unavailable")

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

@app.post("/api/external/verify-and-charge")
def verify_and_charge_card(req: VerifyCardRequest, db: Session = Depends(get_db)):
    """
    Endpoint for external banks to verify and charge a credit card.
    1. Validates if the card exists.
    2. Validates if it has sufficient credit limit.
    3. Charges the card and returns a confirmation.
    """
    card = db.query(Card).filter(
        Card.card_number == req.card_number,
        Card.expiry == req.expiry_date,
        Card.cvv == req.cvv
    ).first()
    
    if not card:
        return {"status": "rejected", "reason": "Card not found or details are incorrect"}
    
    if card.credit_limit < req.amount:
        return {"status": "rejected", "reason": "Insufficient credit limit"}
    
    # Charge the card
    card.credit_limit -= req.amount

    # Log the transaction for the card owner
    tx_out = Transaction(
        user_id=card.user_id,
        amount=-req.amount,
        transaction_type="purchase",
        description=f"Pago Externo: {req.description}",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(tx_out)
    
    db.commit()
    db.refresh(card)
    
    return {
        "status": "approved",
        "message": "Payment successful",
        "transaction_id": tx_out.id
    }
