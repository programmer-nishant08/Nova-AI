#!/usr/bin/env python3
"""
NOVA API Server - Complete Backend API with Groq Support
"""

import os
import json
import hashlib
import secrets
from typing import Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from nova import NovaBot, NovaDatabase, PERSONALITIES

# ============================================
# CONFIGURATION
# ============================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 60 * 24 * 7))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ============================================
# DATA MODELS
# ============================================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    personality: Optional[str] = "default"

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Nova AI API",
    description="Complete AI Assistant API with Authentication",
    version="2.0.0"
)

# ✅ CORS for Vercel + Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# PASSWORD HASHING
# ============================================

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode('utf-8'))
    return salt + ":" + hash_obj.hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt, hash_value = hashed_password.split(":")
        hash_obj = hashlib.sha256((salt + plain_password).encode('utf-8'))
        return hash_obj.hexdigest() == hash_value
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ============================================
# DATABASE FUNCTIONS
# ============================================

def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email from database"""
    db = NovaDatabase()
    try:
        db.cursor.execute(
            "SELECT id, username, email, password_hash FROM users WHERE email = ?", 
            (email,)
        )
        user = db.cursor.fetchone()
        db.close()
        if user:
            return {"id": user[0], "username": user[1], "email": user[2], "password_hash": user[3]}
        return None
    except Exception as e:
        db.close()
        print(f"Database error: {e}")
        return None

def get_user_by_username(username: str) -> Optional[dict]:
    """Get user by username from database"""
    db = NovaDatabase()
    try:
        db.cursor.execute(
            "SELECT id, username, email, password_hash FROM users WHERE username = ?", 
            (username,)
        )
        user = db.cursor.fetchone()
        db.close()
        if user:
            return {"id": user[0], "username": user[1], "email": user[2], "password_hash": user[3]}
        return None
    except Exception as e:
        db.close()
        print(f"Database error: {e}")
        return None

def create_user(username: str, email: str, password: str) -> Optional[int]:
    """Create a new user in database"""
    db = NovaDatabase()
    try:
        password_hash = hash_password(password)
        db.cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash)
        )
        db.conn.commit()
        user_id = db.cursor.lastrowid
        db.close()
        return user_id
    except Exception as e:
        db.close()
        print(f"Error creating user: {e}")
        return None

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

# ============================================
# BOT INSTANCES
# ============================================

bot_instances = {}

def get_bot(username: str) -> NovaBot:
    """Get or create a bot instance for a user"""
    if username not in bot_instances:
        bot_instances[username] = NovaBot(username)
    return bot_instances[username]

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_db():
    """Initialize database with required tables and columns"""
    db = NovaDatabase()
    try:
        db.cursor.execute("ALTER TABLE users ADD COLUMN email TEXT UNIQUE")
    except:
        pass
    try:
        db.cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
    except:
        pass
    db.conn.commit()
    db.close()

init_db()

# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Nova AI API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# AUTH ENDPOINTS
# ============================================

@app.post("/api/register")
async def register(user: UserCreate):
    """Register a new user"""
    print(f"📝 Registration attempt: {user.email}")
    
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_id = create_user(user.username, user.email, user.password)
    if not user_id:
        raise HTTPException(status_code=400, detail="Registration failed")
    
    print(f"✅ User created with ID: {user_id}")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user.username,
            "email": user.email
        }
    }

@app.post("/api/login")
async def login(user: UserLogin):
    """Login a user"""
    db_user = get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "username": db_user["username"],
            "email": db_user["email"]
        }
    }

# ============================================
# CONVERSATION ENDPOINTS
# ============================================

@app.get("/api/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for the current user"""
    try:
        bot = get_bot(current_user["username"])
        conversations = bot.get_conversations()
        return {"success": True, "conversations": conversations}
    except Exception as e:
        print(f"Get conversations error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/conversations")
async def create_conversation(data: ConversationCreate, current_user: dict = Depends(get_current_user)):
    """Create a new conversation"""
    try:
        print(f"📝 Creating conversation for user: {current_user['username']}")
        bot = get_bot(current_user["username"])
        conv_id = bot.create_new_conversation(data.title)
        print(f"✅ Conversation created with ID: {conv_id}")
        return {
            "success": True,
            "conversation_id": conv_id,
            "message": "Conversation created"
        }
    except Exception as e:
        print(f"❌ Create conversation error: {e}")
        return {"success": False, "error": str(e)}

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a conversation"""
    try:
        bot = get_bot(current_user["username"])
        bot.delete_conversation(conversation_id)
        return {"success": True, "message": "Conversation deleted"}
    except Exception as e:
        print(f"Delete conversation error: {e}")
        return {"success": False, "error": str(e)}

# ============================================
# MESSAGE ENDPOINTS
# ============================================

@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: int, current_user: dict = Depends(get_current_user)):
    """Get messages from a conversation"""
    try:
        bot = get_bot(current_user["username"])
        bot.switch_conversation(conversation_id)
        messages = bot.get_messages()
        return {"success": True, "messages": messages}
    except Exception as e:
        print(f"Get messages error: {e}")
        return {"success": False, "error": str(e)}

# ============================================
# CHAT ENDPOINT
# ============================================

@app.post("/api/chat")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Send a message to the AI"""
    try:
        bot = get_bot(current_user["username"])
        
        if request.personality and request.personality != bot.personality:
            bot.switch_personality(request.personality)
        
        if request.conversation_id:
            bot.switch_conversation(request.conversation_id)
        
        response = bot.get_response(request.message)
        
        return {
            "success": True,
            "response": response,
            "conversation_id": bot.conversation_id,
            "username": current_user["username"]
        }
    except Exception as e:
        print(f"Chat error: {e}")
        return {"success": False, "error": str(e)}

# ============================================
# PERSONALITIES ENDPOINT
# ============================================

@app.get("/api/personalities")
async def get_personalities():
    """Get all available personalities"""
    return {"success": True, "personalities": list(PERSONALITIES.keys())}

# ============================================
# STATS ENDPOINT
# ============================================

@app.get("/api/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics"""
    try:
        bot = get_bot(current_user["username"])
        stats = bot.get_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        print(f"Get stats error: {e}")
        return {"success": False, "error": str(e)}

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║  🚀 NOVA API SERVER v2.0 - WITH GROQ SUPPORT            ║
    ║  📡 API: http://localhost:8000                          ║
    ║  📚 Docs: http://localhost:8000/docs                    ║
    ║  🔐 Auth: JWT Authentication Ready                      ║
    ║  🤖 Model: Groq Llama (or fallback to Ollama)          ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(
        "nova_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )