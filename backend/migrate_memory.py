"""
Database Migration: Add User Memory Table
Run this script once to add the memory table to your existing database
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    print(f"🚀 Starting migration at {datetime.now().isoformat()}")
    
    # Connect to your database
    db_path = "nova_database.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create user_memory table
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                memory_type TEXT NOT NULL,  -- 'preference', 'fact', 'project', 'trait'
                content TEXT NOT NULL,
                source_message_id INTEGER,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (source_message_id) REFERENCES messages(id) ON DELETE SET NULL
            )
        ''')
        print("✅ Created user_memory table")
    except Exception as e:
        print(f"⚠️ Table may already exist: {e}")
    
    # Add summary column to conversations table
    try:
        cursor.execute('''
            ALTER TABLE conversations ADD COLUMN summary TEXT
        ''')
        print("✅ Added summary column to conversations")
    except Exception as e:
        print(f"⚠️ Summary column may already exist: {e}")
    
    # Add pinned column to conversations table
    try:
        cursor.execute('''
            ALTER TABLE conversations ADD COLUMN pinned BOOLEAN DEFAULT 0
        ''')
        print("✅ Added pinned column to conversations")
    except Exception as e:
        print(f"⚠️ Pinned column may already exist: {e}")
    
    # Add tags column to conversations table
    try:
        cursor.execute('''
            ALTER TABLE conversations ADD COLUMN tags TEXT DEFAULT '[]'
        ''')
        print("✅ Added tags column to conversations")
    except Exception as e:
        print(f"⚠️ Tags column may already exist: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"✅ Migration completed at {datetime.now().isoformat()}")

if __name__ == "__main__":
    migrate()