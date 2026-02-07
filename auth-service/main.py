from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import Base, engine, get_db, SessionLocal
from models import User
from pydantic import BaseModel, validator
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    password: str
    role: str = "client"
    cedula: Optional[str] = None
    phone: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if not v:
            return None
        
        # Remove + if present
        if v.startswith("+"):
            v = v[1:]
            
        v = v.strip().replace(" ", "").replace("-", "")
        
        allowed_prefixes = ["0412", "0422", "0414", "0424", "0416", "0426"]
        
        # Check basic digit requirement
        if not v.isdigit():
             raise ValueError("El teléfono solo debe contener números")

        # Handle 12 digits starting with 58 (e.g., 584121234567) -> treat as local
        if len(v) == 12 and v.startswith("58"):
             v = "0" + v[2:] # 58412... -> 0412...

        # Handle 10 digits (e.g., 4121234567 -> 04121234567)
        if len(v) == 10 and v.startswith("4"):
            v = "0" + v

        # Check if it matches length 11 (e.g. 0412...)
        if len(v) == 11:
            prefix = v[:4]
            if prefix not in allowed_prefixes:
                raise ValueError(f"El prefijo debe ser uno de: {', '.join(allowed_prefixes)}")
            return "+58" + v[1:]
            
        raise ValueError("El teléfono debe tener 11 dígitos y comenzar con 04xx (ej. 04121234567)")

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str
    cedula: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # Create default admin
            hashed_pw = get_password_hash("admin")
            admin_user = User(username="admin", hashed_password=hashed_pw, role="admin", cedula="00000000")
            db.add(admin_user)
            db.commit()
            print("Default admin user created (admin/admin)")
    finally:
        db.close()

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if user.cedula:
        db_cedula = db.query(User).filter(User.cedula == user.cedula).first()
        if db_cedula:
            raise HTTPException(status_code=400, detail="Cedula already registered")

    if user.phone:
        db_phone = db.query(User).filter(User.phone == user.phone).first()
        if db_phone:
            raise HTTPException(status_code=400, detail="Phone already registered")

    # Public registration forces client role
    hashed_password = get_password_hash(user.password)
    # Ensure cedula is passed
    new_user = User(
        username=user.username, 
        full_name=user.full_name, 
        hashed_password=hashed_password, 
        role="client", 
        cedula=user.cedula,
        phone=user.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/search", response_model=UserResponse)
def search_user(cedula: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
     # Verify Staff
    from jose import jwt
    SECRET_KEY = "mysecretkey"
    ALGORITHM = "HS256"
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role not in ["admin", "teller", "customer_service"]:
             raise HTTPException(status_code=403, detail="Not authorized")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.cedula == cedula).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/admin/create-staff", response_model=UserResponse)
def create_staff(user: UserCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify Admin
    from jose import jwt
    SECRET_KEY = "mysecretkey"
    ALGORITHM = "HS256"
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "admin":
             raise HTTPException(status_code=403, detail="Not authorized")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Allow staff roles
    if user.role not in ["teller", "customer_service"]:
        raise HTTPException(status_code=400, detail="Invalid staff role")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Ideally implement JWT here. For simplicity in this step, returning user info + dummy token.
    # In a real microservice, we should issue a JWT.
    # Let's emit a fake token for now to satisfy OAuth2 flow, or implement simple JWT.
    # I'll add simple JWT generation if needed, but for "money printer" purposes, maybe basic logic is enough.
    # Let's stick to a simple dummy token or just return success?
    # No, services need to verify user. JWT is best.
    
    # Minimal JWT implementation
    from jose import jwt
    import datetime
    
    SECRET_KEY = "mysecretkey"
    ALGORITHM = "HS256"
    
    token_data = {
        "sub": user.username,
        "role": user.role,
        "user_id": user.id
    }
    encoded_jwt = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": encoded_jwt, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify token
    from jose import jwt
    SECRET_KEY = "mysecretkey"
    ALGORITHM = "HS256"
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
