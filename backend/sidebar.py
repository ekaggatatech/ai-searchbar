from database import get_connection


def insert_sidebar():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("DELETE FROM sidebar")

    data = [

        ("Dashboard","home","/"),

        ("HR","users","/hr"),

        ("Finance","wallet","/finance"),

        ("IT","cpu","/it"),

        ("Administration","building","/admin"),

        ("Sales","chart","/sales"),

        ("Search History","history","/history"),

        ("Settings","settings","/settings")
    ]

    cursor.executemany(

        "INSERT INTO sidebar(name,icon,route) VALUES(?,?,?)",

        data
    )

    conn.commit()

    conn.close()