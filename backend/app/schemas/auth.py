"""
Pydantic schemas for Authentication and User management.
"""

import re
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class UserRegister(BaseModel):
    """Schema for registering a new user."""
    email: str = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, max_length=100, description="Plaintext password (min 8 chars)")
    full_name: str | None = Field(None, max_length=255, description="User's optional full name")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format manually to avoid external dependency issues."""
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email address format")
        return v.lower()


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.lower()


class UserResponse(BaseModel):
    """Schema for returning user information."""
    id: uuid.UUID
    email: str
    full_name: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT access token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for payload parsed from JWT access token."""
    user_id: str | None = None
    role: str | None = None
