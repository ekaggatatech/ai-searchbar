from database import get_connection


def save_search(query):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO search_history(query) VALUES(?)",
        (query,)
    )

    conn.commit()

    conn.close()


def get_history():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM search_history
        ORDER BY searched_at DESC
        LIMIT 10
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]