"""
Database models and Pydantic schemas for Nova AI
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ============================================
# Pydantic Models (Request/Response)
# ============================================

class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user response"""
    id: int
    username: str
    email: str
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Schema for JWT token data"""
    email: Optional[str] = None

class ChatRequest(BaseModel):
    """Schema for chat request"""
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None
    personality: Optional[str] = "default"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class ChatResponse(BaseModel):
    """Schema for chat response"""
    success: bool
    response: Optional[str] = None
    conversation_id: Optional[int] = None
    error: Optional[str] = None

class ConversationCreate(BaseModel):
    """Schema for creating a conversation"""
    title: Optional[str] = "New Conversation"

class ConversationResponse(BaseModel):
    """Schema for conversation response"""
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

class GoogleAuthRequest(BaseModel):
    """Schema for Google authentication"""
    email: EmailStr
    name: Optional[str] = None

# ============================================
# Database Models (Internal)
# ============================================

class User:
    """User database model"""
    def __init__(self, id: int, username: str, email: str, password_hash: str = None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.first_seen = None
        self.last_seen = None
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_seen": self.first_seen,
            "last_seen": self.last_seen
        }

class Conversation:
    """Conversation database model"""
    def __init__(self, id: int, user_id: int, title: str = "New Conversation"):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.created_at = None
        self.updated_at = None

class Message:
    """Message database model"""
    def __init__(self, id: int, conversation_id: int, role: str, content: str):
        self.id = id
        self.conversation_id = conversation_id
        self.role = role  # 'user', 'assistant', 'system'
        self.content = content
        self.timestamp = None

# ============================================
# API Response Models
# ============================================

class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    message: Optional[str] = None

class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    items: List[dict]
    total: int
    page: int
    per_page: int
    total_pages: int