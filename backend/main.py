import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables, get_connection
from sidebar import insert_sidebar
from history import save_search, get_history
from suggestion import get_suggestions
from search import search_documents
from semantic_search import semantic_search
from models import SearchRequest

app = FastAPI(title="AI Enterprise Search API")


# -----------------------------
# Initial Setup
# -----------------------------

create_tables()
insert_sidebar()

with open("metadata.json", "r", encoding="utf-8") as file:
    DOCUMENTS = json.load(file)


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "AI Enterprise Search Backend Running"
    }


# -----------------------------
# Sidebar
# -----------------------------

@app.get("/sidebar")
def sidebar():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("SELECT * FROM sidebar")

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# -----------------------------
# Suggestions
# -----------------------------

@app.get("/suggestions")
def suggestions(query: str):
    return get_suggestions(query)


# -----------------------------
# Search History
# -----------------------------

@app.post("/history")
def add_history(search: SearchRequest):

    save_search(search.query)

    return {
        "message": "Search saved successfully"
    }


@app.get("/history")
def history():

    return get_history()


@app.delete("/history/{history_id}")
def delete_history(history_id: int):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM search_history WHERE id=?",
        (history_id,)
    )

    conn.commit()

    conn.close()

    return {
        "message": "Deleted Successfully"
    }


# -----------------------------
# Keyword Search
# -----------------------------

@app.post("/search")
def search(search: SearchRequest):

    results = search_documents(search.query)

    return {

        "query": search.query,

        "total_results": len(results),

        "results": results

    }


# -----------------------------
# AI Semantic Search
# -----------------------------

@app.post("/ai-search")
def ai_search(search: SearchRequest):

    results = semantic_search(
        search.query,
        search.top_k
    )

    return {

        "query": search.query,

        "total_results": len(results),

        "results": results

    }


# -----------------------------
# Dynamic Document Page
# -----------------------------

@app.get("/document/{doc_id}")
def get_document(doc_id: str):

    for doc in DOCUMENTS:

        if str(doc["doc_id"]) == str(doc_id):
            return doc

    return {
        "detail": "Document not found"
    }


# -----------------------------
# Dynamic Category Page
# -----------------------------

@app.get("/category/{category}")
def get_category(category: str):

    results = []

    for doc in DOCUMENTS:

        if doc["department"].lower() == category.lower():

            results.append(doc)

    return results