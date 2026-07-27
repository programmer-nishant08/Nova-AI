"""
Utility functions for Nova AI
"""

import re
import json
import secrets
from datetime import datetime
from typing import Optional, Any
import hashlib

# ============================================
# String Utilities
# ============================================

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection"""
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to max length with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."

def generate_conversation_title(first_message: str) -> str:
    """Generate a title from the first message"""
    # Clean the message
    cleaned = sanitize_input(first_message)
    # Truncate to 30 characters
    if len(cleaned) <= 30:
        return cleaned
    return cleaned[:30] + "..."

def extract_code_blocks(text: str) -> list:
    """Extract code blocks from markdown text"""
    pattern = r'```(\w+)?\n([\s\S]+?)```'
    matches = re.findall(pattern, text)
    return [{"language": lang or "text", "code": code.strip()} for lang, code in matches]

# ============================================
# Date/Time Utilities
# ============================================

def format_timestamp(timestamp: Optional[str] = None) -> str:
    """Format timestamp for display"""
    if timestamp:
        try:
            dt = datetime.fromisoformat(timestamp)
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except:
            pass
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def time_ago(timestamp: datetime) -> str:
    """Get human-readable time difference"""
    now = datetime.now()
    diff = now - timestamp
    
    seconds = diff.total_seconds()
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes}m ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours}h ago"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"{days}d ago"
    else:
        return timestamp.strftime("%b %d, %Y")

# ============================================
# JSON Utilities
# ============================================

def safe_json_loads(text: str) -> dict:
    """Safely load JSON with error handling"""
    try:
        return json.loads(text)
    except:
        return {}

def safe_json_dumps(data: Any, indent: int = 2) -> str:
    """Safely dump JSON with error handling"""
    try:
        return json.dumps(data, indent=indent, default=str)
    except:
        return "{}"

# ============================================
# Security Utilities
# ============================================

def generate_secure_key(length: int = 32) -> str:
    """Generate a secure random key"""
    return secrets.token_urlsafe(length)

def hash_text(text: str) -> str:
    """Hash text using SHA-256"""
    return hashlib.sha256(text.encode()).hexdigest()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_username(username: str) -> bool:
    """Validate username format"""
    # Alphanumeric, underscore, dot, hyphen, 3-30 characters
    pattern = r'^[a-zA-Z0-9_.-]{3,30}$'
    return bool(re.match(pattern, username))

# ============================================
# File Utilities
# ============================================

def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    try:
        import os
        return os.path.getsize(file_path)
    except:
        return 0

def read_file_content(file_path: str) -> Optional[str]:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return None

def write_file_content(file_path: str, content: str) -> bool:
    """Write file content safely"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except:
        return False

# ============================================
# Text Processing
# ============================================

def count_words(text: str) -> int:
    """Count words in text"""
    return len(text.split())

def count_tokens_estimate(text: str) -> int:
    """Estimate token count (rough approximation)"""
    # Approximate: 1 token ≈ 4 characters
    return len(text) // 4

def split_text_into_chunks(text: str, chunk_size: int = 1000) -> list:
    """Split text into chunks for processing"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) > chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_length = len(word)
        else:
            current_chunk.append(word)
            current_length += len(word) + 1
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

# ============================================
# Response Formatting
# ============================================

def format_success_response(data: Any, message: str = "Success") -> dict:
    """Format success response"""
    return {
        "success": True,
        "data": data,
        "message": message
    }

def format_error_response(error: str, status_code: int = 400) -> dict:
    """Format error response"""
    return {
        "success": False,
        "error": error,
        "status_code": status_code
    }

# ============================================
# Export all utilities
# ============================================

__all__ = [
    'sanitize_input',
    'truncate_text',
    'generate_conversation_title',
    'extract_code_blocks',
    'format_timestamp',
    'time_ago',
    'safe_json_loads',
    'safe_json_dumps',
    'generate_secure_key',
    'hash_text',
    'validate_email',
    'validate_username',
    'get_file_size',
    'read_file_content',
    'write_file_content',
    'count_words',
    'count_tokens_estimate',
    'split_text_into_chunks',
    'format_success_response',
    'format_error_response',
]