import random
import time
import jwt
import bcrypt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import yfinance as yf
import requests

from database.session import get_db
from database.models import User, Watchlist

SECRET_KEY = "your-production-super-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200

# Optional Gmail SMTP Credentials
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = ""      # e.g., "yourname@gmail.com"
SENDER_PASSWORD = ""   # e.g., 16-character Gmail App Password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
router = APIRouter()

CUSTOM_SESSION = requests.Session()
CUSTOM_SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
})

OTP_STORE: Dict[str, Dict] = {}

COMPANY_NAMES = {
    "RELIANCE.NS": "Reliance Industries Ltd.",
    "TCS.NS": "Tata Consultancy Services Ltd.",
    "INFY.NS": "Infosys Limited",
    "HDFCBANK.NS": "HDFC Bank Ltd.",
    "ICICIBANK.NS": "ICICI Bank Ltd.",
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "NVDA": "NVIDIA Corporation",
}

def resolve_ticker_name(symbol: str) -> str:
    clean = symbol.strip().upper()
    if clean in COMPANY_NAMES:
        return COMPANY_NAMES[clean]
    try:
        t = yf.Ticker(clean, session=CUSTOM_SESSION)
        info = t.info
        name = info.get("longName") or info.get("shortName")
        if name:
            return name
    except Exception:
        pass
    return clean

def send_smtp_email(recipient_email: str, otp_code: str) -> bool:
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        return False
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = "MarketMind AI - Account Verification Code"

        body = (
            f"Hello,\n\n"
            f"Your verification code for MarketMind AI is: {otp_code}\n\n"
            f"This code is valid for 10 minutes.\n\n"
            f"If you did not request this code, please ignore this email."
        )
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=3)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"[SMTP Notice] Email sending skipped ({e}). Using terminal output.")
        return False

# Pydantic Schemas
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class UserRegister(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    referral_code: Optional[str] = None
    initial_watchlist: Optional[List[str]] = []

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Security Helpers
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Current User Dependency for Protected Endpoints
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Router Endpoints
@router.post("/send-otp")
def send_otp(req: OTPRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    otp = f"{random.randint(100000, 999999)}"
    OTP_STORE[req.email.lower()] = {
        "otp": otp,
        "expires": time.time() + 600
    }

    print(f"\n==========================================")
    print(f"[MarketMind Auth] OTP FOR {req.email}: {otp}")
    print(f"==========================================\n")

    if SENDER_EMAIL and SENDER_PASSWORD:
        send_smtp_email(req.email, otp)

    return {"message": "Verification OTP generated successfully."}

@router.post("/verify-otp")
def verify_otp(req: OTPVerify):
    data = OTP_STORE.get(req.email.lower())
    if not data:
        raise HTTPException(status_code=400, detail="No OTP requested for this email.")
    if time.time() > data["expires"]:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")
    if data["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    return {"message": "Email verified successfully."}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_in.initial_watchlist:
        for symbol in user_in.initial_watchlist:
            clean_sym = symbol.strip().upper()
            resolved_name = resolve_ticker_name(clean_sym)
            db.add(Watchlist(user_id=new_user.id, symbol=clean_sym, name=resolved_name))
        db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}