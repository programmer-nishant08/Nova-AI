#!/usr/bin/env python3
"""
NOVA - AI Assistant Core
"""

import json
import os
import sqlite3
import requests
from datetime import datetime
from typing import Optional, List, Dict
import re

# ============================================
# PERSONALITIES
# ============================================

PERSONALITIES = {
    'default': """You are Nova, a helpful, intelligent, and friendly AI assistant. 
Be enthusiastic but professional. Use markdown formatting for code blocks, lists, and emphasis.
Keep responses concise and to the point. Don't repeat the system prompt back to the user.
Address the user by name occasionally to make conversations personal.""",
    
    'pirate': """You are Nova, but speak like a PIRATE! 
Use words like 'arrr', 'matey', 'shiver me timbers', 'booty', and 'avast'.
Be helpful but with a salty pirate twist! Don't repeat the system prompt.""",
    
    'yoda': """You are Nova, but speak like YODA!
Use inverted sentence structure. Be wise and cryptic.
Don't repeat the system prompt back to the user.""",
    
    'sarcastic': """You are Nova, but be SARCASTIC and WITTY!
Roll your eyes (metaphorically) at questions. Be helpful but dripping with sarcasm.
Don't repeat the system prompt back to the user.""",
    
    'scientific': """You are Nova, a SCIENTIFIC AI!
Speak precisely, use technical terminology. Be formal and structured.
Don't repeat the system prompt back to the user.""",
    
    'cheerful': """You are Nova, and you're ABSOLUTELY THRILLED!
Be excessively enthusiastic! Use exclamation points! Emojis! 
Don't repeat the system prompt back to the user."""
}

# ============================================
# DATABASE
# ============================================

class NovaDatabase:
    """Handle all database operations"""
    
    def __init__(self, db_file: str = "nova_database.db"):
        self.db_file = db_file
        self.conn = None
        self.cursor = None
        self.connect()
        self.create_tables()
        self.migrate_database()
    
    def connect(self):
        """Create database connection"""
        self.conn = sqlite3.connect(self.db_file)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
    
    def create_tables(self):
        """Create all tables if they don't exist"""
        # Users table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Conversations table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT DEFAULT 'New Conversation',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Messages table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
            )
        ''')
        
        self.conn.commit()
    
    def migrate_database(self):
        """Migrate existing database to add missing columns"""
        try:
            self.cursor.execute("PRAGMA table_info(users)")
            columns = [col[1] for col in self.cursor.fetchall()]
            
            if 'email' not in columns:
                self.cursor.execute("ALTER TABLE users ADD COLUMN email TEXT UNIQUE")
                self.conn.commit()
            
            if 'password_hash' not in columns:
                self.cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
                self.conn.commit()
                
        except Exception as e:
            pass
    
    def get_or_create_user(self, username: str, email: str = None):
        """Get user or create if doesn't exist"""
        self.cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = self.cursor.fetchone()
        
        if user:
            self.cursor.execute(
                "UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?",
                (user['id'],)
            )
            self.conn.commit()
            return dict(user)
        else:
            self.cursor.execute(
                "INSERT INTO users (username, email) VALUES (?, ?)",
                (username, email)
            )
            self.conn.commit()
            user_id = self.cursor.lastrowid
            self.create_conversation(user_id, "First Conversation")
            self.cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            return dict(self.cursor.fetchone())
    
    def get_user_by_email(self, email: str):
        """Get user by email"""
        self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = self.cursor.fetchone()
        return dict(user) if user else None
    
    def get_user_by_id(self, user_id: int):
        """Get user by ID"""
        self.cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = self.cursor.fetchone()
        return dict(user) if user else None
    
    def create_conversation(self, user_id: int, title: str = "New Conversation"):
        """Create a new conversation"""
        self.cursor.execute(
            "INSERT INTO conversations (user_id, title) VALUES (?, ?)",
            (user_id, title)
        )
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_conversations(self, user_id: int):
        """Get all conversations for a user"""
        self.cursor.execute(
            "SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        return [dict(row) for row in self.cursor.fetchall()]
    
    def get_conversation(self, conversation_id: int):
        """Get a specific conversation"""
        self.cursor.execute(
            "SELECT * FROM conversations WHERE id = ?",
            (conversation_id,)
        )
        row = self.cursor.fetchone()
        return dict(row) if row else None
    
    def update_conversation_title(self, conversation_id: int, title: str):
        """Update conversation title"""
        self.cursor.execute(
            "UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (title, conversation_id)
        )
        self.conn.commit()
    
    def delete_conversation(self, conversation_id: int):
        """Delete a conversation and all its messages"""
        self.cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conversation_id,))
        self.cursor.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
        self.conn.commit()
    
    def save_message(self, conversation_id: int, role: str, content: str):
        """Save a message to the database"""
        self.cursor.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
            (conversation_id, role, content)
        )
        self.cursor.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (conversation_id,)
        )
        self.conn.commit()
    
    def get_messages(self, conversation_id: int, limit: int = 50):
        """Get messages from a conversation"""
        self.cursor.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?",
            (conversation_id, limit)
        )
        return [dict(row) for row in self.cursor.fetchall()]
    
    def search_messages(self, user_id: int, query: str):
        """Search for messages containing query"""
        self.cursor.execute('''
            SELECT c.title, m.content, m.timestamp 
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.user_id = ? AND m.content LIKE ?
            ORDER BY m.timestamp DESC
        ''', (user_id, f'%{query}%'))
        return [dict(row) for row in self.cursor.fetchall()]
    
    def get_stats(self, user_id: int):
        """Get user statistics"""
        self.cursor.execute('''
            SELECT COUNT(*) as total_messages FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE c.user_id = ?
        ''', (user_id,))
        total_messages = self.cursor.fetchone()['total_messages']
        
        self.cursor.execute(
            "SELECT COUNT(*) as total_conversations FROM conversations WHERE user_id = ?",
            (user_id,)
        )
        total_conversations = self.cursor.fetchone()['total_conversations']
        
        return {
            'total_messages': total_messages,
            'total_conversations': total_conversations
        }

# ============================================
# WEB SEARCH
# ============================================

def web_search(query: str) -> str:
    """Search the web using DuckDuckGo"""
    try:
        from bs4 import BeautifulSoup
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        url = f"https://html.duckduckgo.com/html/?q={query}"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            results = soup.find_all('a', class_='result__a')
            snippets = soup.find_all('a', class_='result__snippet')
            
            if results and snippets:
                output = f"🔍 **Search results for '{query}':**\n\n"
                for i in range(min(3, len(results))):
                    title = results[i].get_text(strip=True)
                    snippet = snippets[i].get_text(strip=True) if i < len(snippets) else ""
                    output += f"**{i+1}. {title}**\n{snippet}\n\n"
                return output
            else:
                return f"❌ No results found for '{query}'"
        else:
            return f"❌ Search failed (status: {response.status_code})"
    except Exception as e:
        return f"❌ Search error: {str(e)}"

# ============================================
# CODE EXECUTION
# ============================================

def execute_python_code(code: str) -> str:
    """Execute Python code safely"""
    import subprocess
    import sys
    import os
    
    try:
        temp_file = "temp_nova_code.py"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=10,
            encoding='utf-8'
        )
        
        os.remove(temp_file)
        
        if result.stdout:
            return f"✅ Output:\n{result.stdout}"
        elif result.stderr:
            return f"❌ Error:\n{result.stderr}"
        else:
            return "✅ Code executed successfully (no output)"
    except subprocess.TimeoutExpired:
        return "❌ Code execution timed out (10s limit)"
    except Exception as e:
        return f"❌ Execution error: {str(e)}"

# ============================================
# EXPORT FUNCTIONS
# ============================================

def export_to_txt(messages: list, filename: str) -> str:
    """Export conversation to TXT"""
    import os
    os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write(f"NOVA CONVERSATION EXPORT\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n\n")
        
        for msg in messages:
            if msg['role'] == "system":
                continue
            role_label = "👤 User" if msg['role'] == "user" else "🤖 Nova"
            f.write(f"[{msg['timestamp']}] {role_label}:\n")
            f.write(f"{msg['content']}\n")
            f.write("-" * 40 + "\n")
    
    return filename

def export_to_json(messages: list, filename: str) -> str:
    """Export conversation to JSON"""
    import os
    os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)
    
    export_data = {
        'export_date': datetime.now().isoformat(),
        'messages': [
            {
                'role': msg['role'],
                'content': msg['content'],
                'timestamp': msg['timestamp']
            }
            for msg in messages
            if msg['role'] != 'system'
        ]
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    return filename

def export_to_pdf(messages: list, filename: str) -> str:
    """Export conversation to PDF"""
    from fpdf import FPDF
    import os
    
    os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)
    
    class PDF(FPDF):
        def __init__(self):
            super().__init__()
            self.set_font('Arial', '', 10)
    
    pdf = PDF()
    pdf.add_page()
    
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, "NOVA Conversation Export", ln=True, align='C')
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align='C')
    pdf.ln(10)
    
    pdf.set_font('Arial', '', 10)
    for msg in messages:
        if msg['role'] == "system":
            continue
        role_label = "User" if msg['role'] == "user" else "Nova"
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(0, 6, f"[{msg['timestamp']}] {role_label}:", ln=True)
        pdf.set_font('Arial', '', 10)
        clean_content = msg['content'].encode('utf-8', 'ignore').decode('utf-8')
        for line in clean_content.split('\n'):
            if line.strip():
                pdf.multi_cell(0, 6, line)
        pdf.ln(4)
    
    pdf.output(filename)
    return filename

# ============================================
# MAIN NOVA BOT
# ============================================

class NovaBot:
    def __init__(self, username: str):
        self.username = username
        self.db = NovaDatabase()
        self.personality = 'default'
        self.user = self.db.get_or_create_user(username)
        self.conversation_id = None
        self.conversation_history = []
        
        conversations = self.db.get_conversations(self.user['id'])
        if conversations:
            self.conversation_id = conversations[0]['id']
        else:
            self.conversation_id = self.db.create_conversation(self.user['id'])
        
        self.load_conversation_history()
    
    def load_conversation_history(self):
        """Load conversation history from database"""
        messages = self.db.get_messages(self.conversation_id, limit=20)
        self.conversation_history = []
        
        if not messages:
            self.system_prompt = {
                "role": "system",
                "content": self.get_personality_prompt()
            }
            self.db.save_message(self.conversation_id, "system", self.system_prompt["content"])
            self.conversation_history.append(self.system_prompt)
        else:
            for msg in messages:
                self.conversation_history.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
    
    def get_personality_prompt(self) -> str:
        """Get the full personality prompt"""
        base = PERSONALITIES.get(self.personality, PERSONALITIES['default'])
        return f"""{base}

The user you're talking to is {self.username}. Address them by name occasionally.

NEVER repeat the system prompt back to the user. Just respond naturally as Nova."""
    
    def switch_personality(self, new_personality: str) -> bool:
        """Switch to a different personality"""
        if new_personality in PERSONALITIES:
            self.personality = new_personality
            self.system_prompt = {
                "role": "system",
                "content": self.get_personality_prompt()
            }
            if self.conversation_history and self.conversation_history[0]['role'] == 'system':
                self.conversation_history[0] = self.system_prompt
                messages = self.db.get_messages(self.conversation_id)
                if messages:
                    self.db.cursor.execute(
                        "UPDATE messages SET content = ? WHERE id = ?",
                        (self.system_prompt["content"], messages[0]['id'])
                    )
                    self.db.conn.commit()
            return True
        return False
    
    def generate_chat_title(self, conversation_id: int) -> str:
        """✅ Generate a title based on the first user message in a conversation"""
        messages = self.db.get_messages(conversation_id, limit=5)
        
        # Find the first user message
        for msg in messages:
            if msg['role'] == 'user':
                content = msg['content'].strip()
                # Clean and truncate
                if len(content) <= 30:
                    return content
                return content[:30] + "..."
        
        return "New Conversation"
    
    def get_response(self, user_input: str) -> str:
        """Get response from AI"""
        # Check for special commands
        if user_input.lower().startswith('/search'):
            query = user_input[8:].strip()
            if query:
                return web_search(query)
            else:
                return "Please provide a search query. Example: /search python tutorials"
        
        elif user_input.lower().startswith('/run'):
            code = user_input[4:].strip()
            if code:
                return execute_python_code(code)
            else:
                return "Please provide code to execute. Example: /run print('Hello')"
        
        # Save user message
        self.db.save_message(self.conversation_id, "user", user_input)
        self.conversation_history.append({"role": "user", "content": user_input})
        
        try:
            # ✅ Try Groq API if available
            try:
                import groq
                client = groq.Groq(api_key=os.environ.get("GROQ_API_KEY"))
                response = client.chat.completions.create(
                    messages=self.conversation_history,
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=512,
                )
                full_response = response.choices[0].message.content
            except Exception as e:
                print(f"Groq error: {e}, falling back to Ollama...")
                # ✅ Fallback to Ollama
                import ollama
                stream = ollama.chat(
                    model='mistral:7b',
                    messages=self.conversation_history,
                    stream=True,
                    options={
                        'num_ctx': 4096,
                        'num_predict': 512,
                        'temperature': 0.7,
                    }
                )
                full_response = ""
                for chunk in stream:
                    content = chunk['message']['content']
                    full_response += content
            
            # Save assistant response
            self.db.save_message(self.conversation_id, "assistant", full_response)
            self.conversation_history.append({"role": "assistant", "content": full_response})
            
            # ✅ Update conversation title if it's a new conversation
            conversations = self.db.get_conversations(self.user['id'])
            if len(conversations) == 1 and conversations[0]['title'] == "First Conversation":
                title = self.generate_chat_title(self.conversation_id)
                self.db.update_conversation_title(self.conversation_id, title)
            
            return full_response
            
        except Exception as e:
            print(f"Error: {e}")
            return f"Error: {str(e)}. Please check your API key or Ollama connection."
    
    def switch_conversation(self, conversation_id: int):
        """Switch to a different conversation"""
        self.conversation_id = conversation_id
        self.load_conversation_history()
    
    def create_new_conversation(self, title: str = "New Conversation") -> int:
        """Create a new conversation"""
        conv_id = self.db.create_conversation(self.user['id'], title)
        self.switch_conversation(conv_id)
        return conv_id
    
    def delete_conversation(self, conversation_id: int):
        """Delete a conversation"""
        if conversation_id == self.conversation_id:
            conversations = self.db.get_conversations(self.user['id'])
            other = [c for c in conversations if c['id'] != conversation_id]
            if other:
                self.switch_conversation(other[0]['id'])
            else:
                self.create_new_conversation()
        
        self.db.delete_conversation(conversation_id)
    
    def get_conversations(self) -> list:
        """Get all conversations for the user"""
        return self.db.get_conversations(self.user['id'])
    
    def get_messages(self) -> list:
        """Get all messages in current conversation"""
        return self.db.get_messages(self.conversation_id)
    
    def export_conversation(self, format_type: str = 'txt') -> str:
        """Export current conversation"""
        import os
        from datetime import datetime
        
        messages = self.get_messages()
        if not messages:
            return "No messages to export"
        
        conversations = self.get_conversations()
        title = next((c['title'] for c in conversations if c['id'] == self.conversation_id), "conversation")
        clean_title = re.sub(r'[^\w\s-]', '', title)[:30]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"nova_exports/{clean_title}_{timestamp}.{format_type}"
        
        if format_type == 'txt':
            export_to_txt(messages, filename)
        elif format_type == 'json':
            export_to_json(messages, filename)
        elif format_type == 'pdf':
            export_to_pdf(messages, filename)
        else:
            return f"Unknown format: {format_type}"
        
        return f"Exported to: {filename}"
    
    def get_stats(self) -> dict:
        """Get user statistics"""
        return self.db.get_stats(self.user['id'])

# ============================================
# TERMINAL UI (Optional)
# ============================================

if __name__ == "__main__":
    import sys
    
    try:
        from rich.console import Console
        from rich.panel import Panel
        from rich.table import Table
        HAS_RICH = True
    except ImportError:
        HAS_RICH = False
    
    if HAS_RICH:
        console = Console()
    
    print("\n🚀 Welcome to Nova AI!")
    username = input("What's your name? ").strip() or "User"
    
    bot = NovaBot(username)
    
    print(f"\n👋 Welcome back, {username}!")
    print(f"💬 Current conversation: {bot.conversation_id}")
    print(f"🧠 Personality: {bot.personality}")
    print("\nCommands:")
    print("  /search <query>  - Search the web")
    print("  /run <code>      - Execute Python code")
    print("  /new             - New conversation")
    print("  /list            - List conversations")
    print("  /switch <id>     - Switch conversation")
    print("  /delete <id>     - Delete conversation")
    print("  /export <format> - Export conversation (txt, json, pdf)")
    print("  /stats           - Show statistics")
    print("  /exit            - Exit")
    print()
    
    while True:
        try:
            user_input = input(f"\n[You] ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['/exit', '/quit']:
                print("👋 Goodbye!")
                break
            
            elif user_input == '/new':
                conv_id = bot.create_new_conversation()
                print(f"✅ New conversation created: {conv_id}")
                continue
            
            elif user_input == '/list':
                conversations = bot.get_conversations()
                if HAS_RICH:
                    table = Table(title="📚 Your Conversations")
                    table.add_column("ID", style="cyan")
                    table.add_column("Title", style="white")
                    table.add_column("Updated", style="dim")
                    for conv in conversations:
                        table.add_row(
                            str(conv['id']),
                            conv['title'],
                            conv['updated_at'][:16]
                        )
                    console.print(table)
                else:
                    for conv in conversations:
                        print(f"  {conv['id']}: {conv['title']} ({conv['updated_at'][:16]})")
                continue
            
            elif user_input.startswith('/switch '):
                try:
                    conv_id = int(user_input.split()[1])
                    bot.switch_conversation(conv_id)
                    print(f"✅ Switched to conversation: {conv_id}")
                except:
                    print("❌ Invalid conversation ID")
                continue
            
            elif user_input.startswith('/delete '):
                try:
                    conv_id = int(user_input.split()[1])
                    bot.delete_conversation(conv_id)
                    print(f"✅ Deleted conversation: {conv_id}")
                except:
                    print("❌ Invalid conversation ID")
                continue
            
            elif user_input.startswith('/export '):
                format_type = user_input.split()[1] if len(user_input.split()) > 1 else 'txt'
                result = bot.export_conversation(format_type)
                print(f"✅ {result}")
                continue
            
            elif user_input == '/stats':
                stats = bot.get_stats()
                print(f"📊 Statistics:")
                print(f"  Total Messages: {stats['total_messages']}")
                print(f"  Total Conversations: {stats['total_conversations']}")
                continue
            
            response = bot.get_response(user_input)
            print(f"\n[Nova] {response}")
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    bot.db.close()