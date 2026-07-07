import sqlite3

DATABASE = "company.db"


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():

    conn = get_connection()

    cursor = conn.cursor()

    # Sidebar Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sidebar(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        icon TEXT,

        route TEXT
    )
    """)

    # Search History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS search_history(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        query TEXT,

        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    conn.close()


create_tables()