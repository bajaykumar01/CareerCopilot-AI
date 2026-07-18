from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from app.services.auth import create_user, authenticate_user, get_user_by_email
from app.utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Define OAuth2 bearer scheme pointing to login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login-form-compat")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency to secure endpoints by verifying the JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user.
    """
    user = create_user(db, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    return user


@router.post("/login", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Standard JSON login endpoint for modern client apps.
    """
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    """
    Returns current logged-in user profile details.
    """
    return current_user
