"""Security foundation, Argon2id hashing, JWT token management, and RBAC dependencies."""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.session import get_db
from app.models.user import User, UserRole

# Password context using Argon2id algorithm
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# HTTP Bearer Token Scheme
security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Generate secure Argon2id hash from plain text password."""
    if not password or not password.strip():
        raise ValueError("Password cannot be empty.")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a stored Argon2id hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.warning(f"Password verification error: {e}")
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token containing claims (sub, role, iat, exp)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({
        "iat": now,
        "exp": expire,
    })
    
    secret_key = settings.JWT_SECRET_KEY or settings.SECRET_KEY
    algorithm = settings.JWT_ALGORITHM or settings.ALGORITHM
    
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token."""
    secret_key = settings.JWT_SECRET_KEY or settings.SECRET_KEY
    algorithm = settings.JWT_ALGORITHM or settings.ALGORITHM
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except JWTError as e:
        logger.debug(f"JWT Decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI Dependency for retrieving authenticated user from Bearer JWT token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


class RoleChecker:
    """Dependency checker enforcing Role-Based Access Control (RBAC)."""

    def __init__(self, allowed_roles: Union[List[UserRole], List[str]]):
        self.allowed_roles = [r.value if isinstance(r, UserRole) else r for r in allowed_roles]

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
        if user_role_str not in self.allowed_roles:
            logger.warning(f"User {current_user.username} ({user_role_str}) denied access requiring roles: {self.allowed_roles}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user


def require_role(roles: Union[UserRole, List[UserRole], str, List[str]]) -> RoleChecker:
    """Helper factory function for RBAC dependency injection."""
    if not isinstance(roles, list):
        roles = [roles]
    return RoleChecker(roles)
