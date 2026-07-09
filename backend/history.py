from database import get_connection


def save_search(query: str):
    conn = get_connection()
    cursor = conn.cursor()

    query = query.strip()

    if query == "":
        conn.close()
        return

    cursor.execute(
        "DELETE FROM search_history WHERE query = ?",
        (query,)
    )

    cursor.execute(
        "INSERT INTO search_history (query) VALUES (?)",
        (query,)
    )

    cursor.execute("""
        DELETE FROM search_history
        WHERE id NOT IN (
            SELECT id FROM search_history
            ORDER BY id DESC
            LIMIT 5
        )
    """)

    conn.commit()
    conn.close()


def get_history():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT query FROM search_history
        ORDER BY id DESC
        LIMIT 5
    """)

    rows = cursor.fetchall()
    conn.close()

    return [row["query"] for row in rows]
